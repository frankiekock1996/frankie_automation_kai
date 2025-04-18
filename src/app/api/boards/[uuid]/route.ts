// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/db";
import { validate } from "uuid";
import { Column } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { randomHexColor } from "@/utils/utils";
import { auth } from "@/lib/auth";
import { Session } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
// export default async function handler(
//   req: NextRequest,
//   res: NextApiResponse
// ) {
//   const session = await auth();
//   if (!session) {
//     NextResponse.status(401).end("Unauthorized");
//     return;
//   }
//   if (!req.query.uuid || !validate(req.query.uuid.toString())) {
//     NextResponse.status(400).end("Invalid board UUID");
//     return;
//   }
//   switch (req.method) {
//     case "DELETE": {
//       await deleteBoard(req, res, session);
//       break;
//     }
//     case "GET": {
//       await getBoard(req, res, session);
//       break;
//     }
//     case "PUT": {
//       await updateBoard(req, res, session);
//       break;
//     }
//     default:
//       NextResponse.status(405).end("Method not allowed");
//   }
// }
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const session = await auth();
  const { uuid } = await params;
  return await getBoard(req, uuid, session!);
}
// export async function DELETE() {}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const session = await auth();
  const { uuid } = await params;
  return await updateBoard(req, uuid, session!);
}

const deleteBoard = async (req: NextRequest, uuid: string, session: Session) => {
  const boardUUID = uuid;
  if (!boardUUID) {
    return NextResponse.json("Board uuid is required", { status: 400 });
  }
  const result = await db.board.deleteMany({
    where: {
      uuid: boardUUID,
      userId: session.user.id
    }
  });
  if (result.count === 0)
    return NextResponse.json("Board not found", { status: 404 });
  return NextResponse.next({ status: 200 });
};

const getBoard = async (req: NextRequest, uuid: string, session: Session) => {
  try {
    const board = await db.board.findFirst({
      where: {
        uuid: uuid,
        userId: session.user.id
      },
      include: {
        columns: {
          include: {
            tasks: {
              include: {
                subtasks: {
                  orderBy: {
                    id: "asc"
                  }
                }
              },
              orderBy: {
                position: "asc"
              }
            }
          },
          orderBy: {
            position: "asc"
          }
        }
      }
    });
    if (!board) {
      return NextResponse.json("Board not found", { status: 404 });
    } else {
      return NextResponse.json(board, { status: 200 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
};

const updateBoard = async (req: NextRequest, uuid: string, session: Session) => {
  const boardUUID = uuid;
  const board = await req.json()
  const currentBoardData = await db.board.findFirst({
    where: {
      uuid: boardUUID,
      userId: session.user.id
    },
    include: {
      columns: true
    }
  });
  if (!currentBoardData) {
    return NextResponse.json("Board not found", { status: 404 });
  }
  const columns: Column[] = board.columns;
  const columnsToDelete: string[] = [];

  if (columns) {
    const set = new Set();
    if (columns.some((col) => set.size === (set.add(col.name), set.size))) {
      return NextResponse.json(
        {
          error: "Column names must be unique"
        },
        { status: 400 }
      );
    }
  }

  // Find out which columns were removed and delete them
  for (const column of currentBoardData.columns) {
    const found = columns.find((c) => c.uuid === column.uuid);
    if (!found) {
      columnsToDelete.push(column.uuid);
    }
  }
  // Create a new array of columns
  for (const column of columns) {
    if (!column.uuid) {
      column.uuid = uuidv4();
    }
  }

  return await db.$transaction(async () => {
    if (board.name !== currentBoardData.name) {
      await db.board.updateMany({
        where: { uuid: boardUUID, userId: session.user.id },
        data: { name: board.name }
      });
    }
    if (columnsToDelete.length) {
      await db.column.deleteMany({
        where: {
          uuid: {
            in: columnsToDelete
          }
        }
      });
    }
    for (const column of columns) {
      await db.column.upsert({
        where: {
          uuid: column.uuid
        },
        create: {
          uuid: column.uuid,
          name: column.name,
          position: column.position,
          userId: session.user.id,
          color: column.color || randomHexColor(),
          board: {
            connect: {
              uuid: boardUUID
            }
          }
        },
        update: {
          name: column.name,
          position: column.position
        }
      });
    }
    return NextResponse.json("Board updated", { status: 200 });
  });
};
