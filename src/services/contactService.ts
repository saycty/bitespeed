import pool from "../db";
import { Contact } from "../models/contactModel";

export const findContactsByEmailOrPhone = async (
  email?: string,
  phoneNumber?: string
): Promise<Contact[]> => {
  const result = await pool.query(
    `
    SELECT * FROM Contact
    WHERE email = $1 OR phoneNumber = $2 AND deletedAt IS NULL;
  `,
    [email, phoneNumber]
  );
  return result.rows;
};

export const createContact = async (
  email?: string,
  phoneNumber?: string,
  linkPrecedence: "primary" | "secondary" = "primary",
  linkedId?: number
): Promise<Contact> => {
  const result = await pool.query(
    `
    INSERT INTO Contact (email, phoneNumber, linkPrecedence, linkedId)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `,
    [email, phoneNumber, linkPrecedence, linkedId]
  );
  return result.rows[0];
};

export const updateContact = async (
  id: number,
  linkedId: number,
  linkPrecedence: "primary" | "secondary"
): Promise<void> => {
  await pool.query(
    `
    UPDATE Contact
    SET linkedId = $1, linkPrecedence = $2, updatedAt = CURRENT_TIMESTAMP
    WHERE id = $3;
  `,
    [linkedId, linkPrecedence, id]
  );
};
