
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { v4 as uuidv4, validate } from 'uuid';
import { NewTask } from '@/types';
import { Session } from 'next-auth';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskData: unknown = await request.json();
    if (!isNewTask(taskData)) {
        return NextResponse.json({ error: 'Invalid task data' }, { status: 400 });
    }
    if (taskData.name.length < 1 || taskData.name.length > 120) {
        return NextResponse.json({ error: 'Task name must be between 1 and 120 characters' }, { status: 400 });
    }
    if (!validate(taskData.column_uuid)) {
        return NextResponse.json({ error: 'Invalid column UUID' }, { status: 400 });
    }
    for (const subtask of taskData.subtasks ?? []) {
        if (typeof subtask.name !== 'string' || (subtask.completed && typeof subtask.completed !== 'boolean')) {
            return NextResponse.json({ error: 'Invalid subtask data' }, { status: 400 });
        }
    }

    const task: NewTask & { uuid: string } = {
        name: taskData.name,
        description: taskData.description,
        column_uuid: taskData.column_uuid,
        subtasks: taskData.subtasks ?? [],
        uuid: uuidv4(),
    };

    const columnData = await db.column.findUnique({
        where: {
            uuid: task.column_uuid,
        },
    });
    if (!columnData) {
        return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    const existingColumnTasks = await db.task.findMany({
        where: {
            column_uuid: task.column_uuid,
        },
        orderBy: {
            position: 'desc',
        },
    });

    const nextPosition = existingColumnTasks.length ? existingColumnTasks[0].position + 1 : 0;

    const payload = {
        data: {
            name: task.name,
            uuid: task.uuid,
            subtasks: {},
            description: task.description,
            position: nextPosition,
            userId: session.user.id,
            column: {
                connect: {
                    uuid: task.column_uuid,
                },
            },
        },
    };

    // if (task.subtasks) {
    //     payload.data.subtasks = {
    //         createMany: {
    //             data: task.subtasks.map((subtask) => {
    //                 return {
    //                     name: subtask.name,
    //                     userId: session.user.id,
    //                     uuid: uuidv4(),
    //                     completed: false,
    //                 };
    //             }),
    //         },
    //     };
    // }

    try {
        const newTask = await db.task.create(payload);
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error }, { status: 500 });
    }
} 

const isNewTask = (data: unknown): data is NewTask => {
    return (
        typeof data === 'object' &&
        data !== null &&
        'column_uuid' in data &&
        typeof data.column_uuid === 'string' &&
        'name' in data &&
        typeof data.name === 'string' &&
        (!('description' in data) || typeof data.description === 'string') &&
        (!('subtasks' in data) || data.subtasks instanceof Array)
    );
};
