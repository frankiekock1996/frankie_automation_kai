// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/db";
import { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type UpdatedColumnData = {
  name?: string;
  color?: string;
  position?: number;
};

const decrementHigherPositions = (boardUUID: string, position: number) => {
  return db.column.updateMany({
    where: {
      board_uuid: boardUUID,
      position: {
        gt: position
      }
    },
    data: {
      position: { decrement: 1 }
    }
  });
};

const incrementFromPosition = (boardUUID: string, position: number) => {
  return db.column.updateMany({
    where: {
      board_uuid: boardUUID,
      position: {
        gte: position
      }
    },
    data: {
      position: { increment: 1 }
    }
  });
};

// export default async function handler(req: Request, res: NextApiResponse) {
//   const session = await getServerSession(req, res, options);
//   if (!session) {
//     res.status(401).end("Unauthorized");
//     return;
//   }

//   if (!req.query.uuid || !validate(req.query.uuid.toString())) {
//     res.status(400).end("Invalid column UUID");
//     return;
//   }
//   switch (req.method) {
//     case "DELETE": {
//       await deleteColumn(req, res, session);
//       break;
//     }
//     case "GET": {
//       await getColumn(req, res, session);
//       break;
//     }
//     case "PUT": {
//       await updateColumn(req, res, session);
//       break;
//     }
//     default:
//       res.status(405).end("Method not allowed");
//   }
// }

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const session = await auth();
  const { uuid } = await params;
  return await updateColumn(req, uuid, session!);
}

const updateColumn = async (req: Request, uuid: string, session: Session) => {
  const columnUUID = uuid;
  const columnData: UpdatedColumnData = await req.json();
  console.log("columnUUID",columnUUID,session.user.id)
  const currentColumnData = await db.column.findFirst({
    where: {
      uuid: columnUUID,
      userId: session.user.id
    }
  });
  if (!currentColumnData) {
    return NextResponse.json("Column not found", { status: 404 });
  }
  const { name, color, position } = columnData;
  const payload = {
    name: name ?? currentColumnData.name,
    color: color ?? currentColumnData.color,
    position: position ?? currentColumnData.position
  };

  try {
    const response = await db.$transaction(async (tx) => {
      if (position !== undefined && position !== currentColumnData.position) {
        await decrementHigherPositions(
          currentColumnData.board_uuid,
          currentColumnData.position
        );
        await incrementFromPosition(currentColumnData.board_uuid, position);
      }
      return await tx.column.update({
        where: {
          uuid: columnUUID
        },
        data: payload
      });
    });
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json("Something went wrong", { status: 500 });
  }
};
