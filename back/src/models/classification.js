import pool from '../config/database.js';

class Classification {
    static async create(data) {
        const { code, name, description, parent_id } = data;
        const result = await pool.query(
            'INSERT INTO classification_plan (code, name, description, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, name, description, parent_id]
        );
        return result.rows[0];
    }

    static async findAll() {
        const result = await pool.query('SELECT * FROM classification_plan ORDER BY path');
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM classification_plan WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async getFullTree() {
        const result = await pool.query(`
            SELECT id, code, name, description, parent_id, path,
                   (SELECT COUNT(*) FROM classification_plan c2 WHERE c2.parent_id = c1.id) as children_count
            FROM classification_plan c1
            ORDER BY path
        `);
        return this.buildTree(result.rows);
    }

    static async getChildren(parentId) {
        const result = await pool.query('SELECT * FROM classification_plan WHERE parent_id = $1 ORDER BY name', [parentId]);
        return result.rows;
    }

    static async update(id, data) {
        const { code, name, description } = data;
        const result = await pool.query(
            'UPDATE classification_plan SET code=$1, name=$2, description=$3 WHERE id=$4 RETURNING *',
            [code, name, description, id]
        );

        if (result.rowCount === 0) {
            throw new Error("Classification not found");
        }

        return result.rows[0];
    }

    static async moveNode(id, newParentId) {
        // Prevent moving to self or descendants
        if (newParentId && await this.isDescendant(id, newParentId)) {
            throw new Error("Cannot move node to its own descendant");
        }

        const result = await pool.query(
            'UPDATE classification_plan SET parent_id=$1 WHERE id=$2 RETURNING *',
            [newParentId, id]
        );

        if (result.rowCount === 0) {
            throw new Error("Classification not found");
        }

        // Update paths for the moved node and its descendants
        await this.updatePaths(id);

        return result.rows[0];
    }

   static async delete(id) {
      // Check if there are any child classifications before deleting
      const childCheckResult = await pool.query('SELECT COUNT(*) FROM classification_plan WHERE parent_id=$1', [id]);

      if(parseInt(childCheckResult.rows[0].count) > 0){
          throw new Error("Cannot delete classification with children");
      }

      // Check if there are associated documents
      const docCheckResult = await pool.query('SELECT COUNT(*) FROM documents WHERE classification_id=$1', [id]);

      if(parseInt(docCheckResult.rows[0].count) > 0){
          throw new Error("Cannot delete classification with associated documents");
      }

      await pool.query('DELETE FROM classification_plan WHERE id=$1', [id]);
   }

   static buildTree(flatList) {
       const tree = [];
       const map = {};

       flatList.forEach(item => {
           map[item.id] = { ...item, children: [] };
       });

       flatList.forEach(item => {
           if (item.parent_id) {
               map[item.parent_id].children.push(map[item.id]);
           } else {
               tree.push(map[item.id]);
           }
       });

       return tree;
   }

   static async isDescendant(nodeId, potentialAncestorId) {
       let currentId = potentialAncestorId;
       while (currentId) {
           if (currentId === nodeId) return true;
           const result = await pool.query('SELECT parent_id FROM classification_plan WHERE id = $1', [currentId]);
           currentId = result.rows[0]?.parent_id;
       }
       return false;
   }

   static async updatePaths(nodeId) {
       // This is a simplified version; in a real implementation, you'd need to update paths recursively
       // For now, we'll assume paths are updated via triggers or manual calculation
       // You might want to implement a proper path update mechanism
   }
}

export default Classification;
