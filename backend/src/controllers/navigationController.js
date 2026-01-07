const { prisma } = require('../database/init');

/**
 * Navigation Controller
 * Handles hierarchical navigation tree with role-based filtering
 */

/**
 * Get navigation menu with DFS filtering
 */
exports.getNavigationMenu = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user || !user.role) {
      return res.status(404).json({
        success: false,
        message: 'User or role not found'
      });
    }

    // Get all navigation nodes with their access roles
    const allNodes = await prisma.navigationNode.findMany({
      include: {
        accessRoles: true
      },
      orderBy: { order: 'asc' }
    });

    // Filter nodes based on user's role
    const filterNodesByRole = (nodes, roleName) => {
      return nodes.filter(node => {
        if (node.isPublic) return true;
        
        if (node.accessRoles && node.accessRoles.length > 0) {
          return node.accessRoles.some(role => role.name === roleName);
        }
        
        return true;
      });
    };

    // Build hierarchical tree using DFS
    const buildTree = (nodes, parentId = null) => {
      const children = nodes.filter(node => node.parentId === parentId);
      
      return children.map(node => {
        const nodeData = {
          id: node.id,
          name: node.name,
          type: node.type,
          path: node.path,
          icon: node.icon,
          order: node.order
        };

        const childNodes = buildTree(nodes, node.id);
        if (childNodes.length > 0) {
          nodeData.children = childNodes;
        }

        return nodeData;
      });
    };

    const filteredNodes = filterNodesByRole(allNodes, user.role.name);
    const tree = buildTree(filteredNodes);

    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('Error fetching navigation menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching navigation menu'
    });
  }
};

/**
 * Get public navigation nodes
 */
exports.getPublicNavigation = async (req, res) => {
  try {
    const publicNodes = await prisma.navigationNode.findMany({
      where: { isPublic: true },
      orderBy: { order: 'asc' }
    });

    res.json({
      success: true,
      data: publicNodes
    });
  } catch (error) {
    console.error('Error fetching public navigation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching public navigation'
    });
  }
};
