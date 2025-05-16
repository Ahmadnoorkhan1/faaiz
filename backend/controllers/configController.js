import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get all configuration settings
 * @route GET /api/config
 * @access Private/Admin
 */
export const getConfigurations = async (req, res, next) => {
  try {
    const { category } = req.query;

    // Prepare filter
    const filter = category ? { category } : {};

    const configs = await prisma.config.findMany({
      where: filter,
      orderBy: {
        category: "asc",
      },
    });

    // Group by category
    const groupedConfigs = configs.reduce((acc, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push(config);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      count: configs.length,
      data: groupedConfigs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get configuration by key
 * @route GET /api/config/:key
 * @access Private/Admin
 */
export const getConfigurationByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const config = await prisma.config.findUnique({
      where: { key },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update configuration
 * @route POST /api/config
 * @access Private/Admin
 */
export const upsertConfiguration = async (req, res, next) => {
  try {
    const { key, value, category, description } = req.body;

    if (!key || !value || !category) {
      return res.status(400).json({
        success: false,
        message: "Key, value, and category are required",
      });
    }

    // Upsert (create if not exists, update if exists)
    const config = await prisma.config.upsert({
      where: { key },
      update: {
        value,
        description,
        category,
      },
      create: {
        key,
        value,
        category,
        description,
      },
    });

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete configuration
 * @route DELETE /api/config/:key
 * @access Private/Admin
 */
export const deleteConfiguration = async (req, res, next) => {
  try {
    const { key } = req.params;

    // Check if config exists
    const existingConfig = await prisma.config.findUnique({
      where: { key },
    });

    if (!existingConfig) {
      return res.status(404).json({
        success: false,
        message: "Configuration not found",
      });
    }

    // Delete config
    await prisma.config.delete({
      where: { key },
    });

    res.status(200).json({
      success: true,
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new configuration
 * @route POST /api/config
 * @access Private/Admin
 */
export const createConfiguration = async (req, res, next) => {
  try {
    const { key, value, category, description } = req.body;
    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Key is required",
      });
    }
    if (!value) {
      return res.status(400).json({
        success: false,
        message: "Value is required",
      });
    }
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const config = await prisma.config.create({
      data: {
        key,
        value,
        category,
        description,
      },
    });

    res.status(201).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};
