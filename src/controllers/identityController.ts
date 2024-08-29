import { Request, Response } from "express";
import {
  findContactsByEmailOrPhone,
  createContact,
  updateContact,
} from "../services/contactService";
export const identify = async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or Phone Number required" });
  }

  const contacts = await findContactsByEmailOrPhone(email, phoneNumber);
  console.log("Fetched Contacts:", contacts);

  let primaryContact;
  let secondaryContactIds: number[] = [];

  if (contacts.length === 0) {
    primaryContact = await createContact(email, phoneNumber);
    console.log("Created New Primary Contact:", primaryContact);
  } else {
    primaryContact = contacts.reduce((oldest, contact) => {
      return oldest.createdAt < contact.createdAt ? oldest : contact;
    });
    console.log("Identified Primary Contact:", primaryContact);

    for (const contact of contacts) {
      if (contact.id !== primaryContact.id) {
        await updateContact(contact.id, primaryContact.id, "secondary");
        secondaryContactIds.push(contact.id);
      }
    }
  }

  const emails = contacts.map((c) => c.email).filter((e) => e) as string[];
  const phoneNumbers = Array.from(
    new Set([
      primaryContact.phoneNumber,
      ...contacts.map((c) => c.phoneNumber).filter((p) => p),
    ])
  );

  //console.log("Final Phone Numbers:", phoneNumbers);

  res.json({
    contact: {
      primaryContactId: primaryContact.id,
      emails: [primaryContact.email, ...emails],
      phoneNumbers: [primaryContact.phoneNumber],
      secondaryContactIds,
    },
  });
};
