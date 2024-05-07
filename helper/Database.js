import { db } from "../services/DB.js";

const find = async ({
  tableName,
  where: { status } = {},
  limit,
  count,
  orderBy,
}) => {
  let query = `SELECT * FROM ${tableName} `;

  if (status) {
    query += `WHERE status = ${status}`;
  }
  if (orderBy) {
    query += ` ORDER BY created_at ${orderBy}`;
  }
  if (limit) {
    query += ` LIMIT ${+count},${limit}`;
  }
  const [data] = await db.query(query);

  return data;
};

const findOne = async ({
  tableName = "",
  where = {},
  query: { q, values } = {},
}) => {
  // row query

  if (q) {
    const [userData] = await db.query(q, values);

    return { data: userData[0] };
  }

  let queryConditions = [];
  let queryValues = [];

  for (let filed in where) {
    if (where[filed] !== undefined) {
      queryConditions.push(`${filed} = ?`);
      queryValues.push(where[filed]);
    }
  }

  let query = `SELECT * FROM ${tableName}`;

  if (queryConditions.length !== 0) {
    query += " WHERE " + queryConditions.join(" AND ");
  }

  const [queryData] = await db.query(query, queryValues);

  return { data: queryData[0] };
};

const create = async ({ tableName, values }) => {
  const columns = Object.keys(values).join(", ");
  const valuesData = Object.values(values);

  const placeholders = Array(valuesData.length).fill("?").join(", ");

  const q = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

  const [createdData] = await db.query(q, valuesData);

  const [lastData] = await db.query(
    `SELECT * FROM ${tableName} WHERE id = ${createdData.insertId}`
  );

  return {
    data: lastData[0],
    insertId: createdData.insertId,
  };
};

const update = async ({
  tableName,
  updateFields,
  where = {},
  returnUpdatedBy = {},
}) => {
  let q = `UPDATE ${tableName} SET `;
  let values = [];

  for (const filed in updateFields) {
    if (updateFields[filed] !== undefined) {
      q += `${filed} = ?, `;
      values.push(updateFields[filed]);
    }
  }
  if (!values.length) return false;

  q = q.slice(0, -2);

  let whereQ = "";
  let whereData = [];

  for (const condition in where) {
    if (where[condition] !== undefined) {
      whereQ += `${condition} = ? AND `;
      whereData.push(where[condition]);
    }
  }

  if (whereQ) {
    q += ` WHERE ${whereQ.slice(0, -5)}`;
    values.push(...whereData);
  }

  const [data] = await db.query(q, values);

  if (data.affectedRows === 0) return false;

  if (returnUpdatedBy) {
    for (const filed in returnUpdatedBy) {
      const [data] = await db.query(
        `SELECT * FROM ${tableName} WHERE ${filed} = ?`,
        [returnUpdatedBy[filed]]
      );
      return data[0];
    }
  } else {
    return true;
  }
};

const Database = {
  find,
  findOne,
  create,
  update,
};
export default Database;
