import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createScopingFormController = async (req, res) => {
  const { service, questions, createdById } = req.body;
  console.log({
    service,
    questions,
    createdById
  })

  
  try {
    const scopingForm = await prisma.scopingForm.create({
      data: {
        service,
        questions,
        // createdById:createdById,
        createdBy: {
          connect: {
            id: createdById,
          },
        },
      },
    });

    return res.status(201).json({
      success:true,
      message:"Scoping form created successfully",
      scopingForm
    });
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:"Error creating scoping form",
      error:error.message
    });
  }
};

export const getAllScopingFormsController = async (req, res) => {
  try {
    const {
      orderBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;
    const scopingForms = await prisma.scopingForm.findMany({
      include: {
        createdBy: true,
        client: true,
      },
      orderBy: {
        [orderBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return res.status(200).json(scopingForms);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getScopingFormByServiceController = async (req, res) => {
  const { service } = req.body;

  try {
    const scopingForm = await prisma.scopingForm.findUnique({
      where: { service },
    });

    return res.status(200).json(scopingForm);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateScopingFormController = async (req, res) => {
  const { id, service, questions, createdById, clientId } = req.body;

  try {
    const scopingForm = await prisma.scopingForm.update({
      where: { id },
      data: { service, questions, createdById, clientId },
    });

    return res.status(200).json(scopingForm);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteScopingFormController = async (req, res) => {
  const { id } = req.body;

  try {
    await prisma.scopingForm.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ message: "Scoping form deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
