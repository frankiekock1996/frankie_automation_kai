import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validate, v4 as uuidv4 } from 'uuid';
import type { Subtask } from '@/types';
import { auth } from '@/lib/auth';

// 类型定义移到文件顶部
type OptionalTaskData = {
    name?: string;
    description?: string;
    column_uuid?: string;
    subtasks?: Subtask[];
    position?: number;
};

// 辅助函数移到主函数之前
const validateTaskUpdateData = (taskData: any): string | undefined => {
    if (!taskData || Object.keys(taskData).length === 0) return 'No data to update';
    if (taskData.column && !validate(taskData.column)) return 'Invalid column UUID';
    if (taskData.position && typeof taskData.position !== 'number') return 'Invalid position';
    if (taskData.name && typeof taskData.name !== 'string') return 'Invalid name';
    if (taskData.description && typeof taskData.description !== 'string') return 'Invalid description';
    return;
};

const validateColumns = async (columnUUIDs: string[]): Promise<boolean> => {
    let columnsAreValid = true;
    for (const columnUUID of columnUUIDs) {
        const tasks = await db.task.findMany({
            where: {
                column_uuid: columnUUID,
            },
            orderBy: {
                position: 'asc',
            },
        });
        let position = 0;
        for (const task of tasks) {
            if (task.position !== position) {
                columnsAreValid = false;
                break;
            }
            position++;
        }
    }
    return columnsAreValid;
};

const updateTaskData = async (
    taskUUID: string,
    taskData: OptionalTaskData,
    subtasksToDelete: string[],
    userId: string
) => {
    const { subtasks, ...data } = taskData;
    return db.$transaction(async () => {
        if (subtasksToDelete.length > 0) {
            await db.subtask.deleteMany({
                where: {
                    uuid: {
                        in: subtasksToDelete,
                    },
                },
            });
        }
        if (subtasks) {
            for (const subtask of subtasks) {
                await db.subtask.upsert({
                    where: {
                        uuid: subtask.uuid,
                    },
                    update: {
                        name: subtask.name,
                    },
                    create: {
                        uuid: subtask.uuid,
                        name: subtask.name,
                        userId,
                        task: {
                            connect: {
                                uuid: taskUUID,
                            },
                        },
                    },
                });
            }
        }
        await db.task.update({
            where: {
                uuid: taskUUID,
            },
            data,
        });
    });
};

const decrementHigherPositions = async (columnUUID: string, position: number) => {
    return db.task.updateMany({
        where: {
            column_uuid: columnUUID,
            position: {
                gt: position,
            },
        },
        data: {
            position: { decrement: 1 },
        },
    });
};

const incrementFromPosition = async (columnUUID: string, position: number) => {
    return db.task.updateMany({
        where: {
            column_uuid: columnUUID,
            position: {
                gte: position,
            },
        },
        data: {
            position: { increment: 1 },
        },
    });
};

// 公共错误响应
const unauthorizedResponse = NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
);

const invalidTaskResponse = NextResponse.json(
    { error: 'Invalid task UUID' },
    { status: 400 }
);

// GET 方法优化
export async function GET(request: Request, { params }: { params: { uuid: string } }) {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse;
    if (!params.uuid || !validate(params.uuid)) return invalidTaskResponse;

    try {
        const task = await db.task.findUnique({
            where: {
                uuid: params.uuid,
                userId: session.user.id
            },
            include: {
                subtasks: {
                    orderBy: { id: 'asc' }
                }
            },
        });
        return task
            ? NextResponse.json(task)
            : NextResponse.json({ error: 'Task not found' }, { status: 404 });
    } catch (error) {
        console.error('GET Task Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE 方法优化
export async function DELETE(request: Request, { params }: { params: { uuid: string } }) {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse;
    if (!params.uuid || !validate(params.uuid)) return invalidTaskResponse;

    try {
        const taskData = await db.task.findUnique({
            where: {
                uuid: params.uuid,
                userId: session.user.id
            },
        });
        if (!taskData) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        await db.$transaction(async () => {
            await db.task.delete({ where: { uuid: params.uuid } });
            await decrementHigherPositions(taskData.column_uuid, taskData.position)
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE Task Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT 方法优化
export async function PUT(request: Request, { params }: { params: { uuid: string } }) {
    const session = await auth();
    if (!session?.user) return unauthorizedResponse;
    if (!params.uuid || !validate(params.uuid)) return invalidTaskResponse;

    try {
        const taskData = await request.json();
        const validationError = validateTaskUpdateData(taskData);
        if (validationError) {
            return NextResponse.json(
                { error: validationError },
                { status: 400 }
            );
        }

        const currentTaskData = await db.task.findFirst({
            where: {
                uuid: params.uuid,
                userId: session.user.id,
            },
            include: {
                subtasks: true,
            },
        });
        if (!currentTaskData) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        let { name, description, column_uuid, subtasks, position } = taskData;
        const columnChanged = !!(column_uuid && column_uuid !== currentTaskData.column_uuid);
        const positionChanged = !!(position !== undefined && (position !== currentTaskData.position || columnChanged));
        const column =
            columnChanged || positionChanged
                ? await db.column.findFirst({
                    where: { uuid: column_uuid || currentTaskData.column_uuid },
                    include: { tasks: true },
                })
                : null;
        let movingToEndOfColumn = false;

        const subtasksToDelete: string[] = [];
        if (Array.isArray(subtasks)) {
            for (const subtask of currentTaskData.subtasks) {
                const found = subtasks.find((s: Subtask) => s.uuid === subtask.uuid);
                if (!found) {
                    subtasksToDelete.push(subtask.uuid);
                }
            }
        }

        for (const subtask of subtasks ?? []) {
            if (!subtask.uuid) {
                subtask.uuid = uuidv4();
            }
        }

        if (position) {
            if (!(typeof position === 'number' && Number.isInteger(position) && !isNaN(position))) {
                return NextResponse.json({ error: 'Position must be an integer' }, { status: 400 });
            }
            if (!column) {
                return NextResponse.json({ error: 'Column not found' }, { status: 404 });
            }
            if (position < 0) {
                return NextResponse.json({ error: 'Position cannot be less than 0' }, { status: 400 });
            }
            if (position > column.tasks.length || (!columnChanged && position > column.tasks.length - 1)) {
                position = columnChanged ? column.tasks.length : column.tasks.length - 1;
                movingToEndOfColumn = true;
            }
        }

        const newTaskData: OptionalTaskData = {
            name: name || currentTaskData.name,
            description: typeof description === undefined ? currentTaskData.description : description,
            column_uuid: column_uuid || currentTaskData.column_uuid,
            subtasks: subtasks || currentTaskData.subtasks,
            position: position !== undefined ? position : currentTaskData.position,
        };

        try {
            await db.$transaction(async () => {
                if (!columnChanged && !positionChanged) {
                    await updateTaskData(params.uuid, newTaskData, subtasksToDelete, session.user.id);
                    return;
                }
                if (columnChanged && !column) {
                    throw new Error('Column not found');
                }
                if (columnChanged && !positionChanged) newTaskData.position = column!.tasks.length;
                await decrementHigherPositions(currentTaskData.column_uuid, currentTaskData.position);
                if (positionChanged && !movingToEndOfColumn) {
                    await incrementFromPosition(columnChanged ? column_uuid : currentTaskData.column_uuid, position);
                }
                await updateTaskData(params.uuid, newTaskData, subtasksToDelete, session.user.id);
                const dataAfterUpdateIsValid = await validateColumns(
                    columnChanged ? [column_uuid, currentTaskData.column_uuid] : [currentTaskData.column_uuid]
                );
                if (!dataAfterUpdateIsValid) {
                    throw new Error('Invalid position of tasks after update');
                }
            });
            return NextResponse.json({ message: 'Task updated' });
        } catch (e) {
            console.error(e);
            return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
        }
    } catch (error) {
        console.error('PUT Task Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
