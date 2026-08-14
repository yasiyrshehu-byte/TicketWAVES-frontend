# TicketWAVES backend integration notes

The frontend update is intentionally strict about persistence: it does not claim that a record is saved unless the backend accepts the request.

## Ownership

A ticket must have a server-side owner. A recommended ticket document contains:

```text
_id
eventId
ownerId
orderId
ticketCode
quantity
section
row
seat
status
price
createdAt
updatedAt
```

For an admin giveaway, the backend should atomically:

1. find the recipient account by email/id;
2. verify the ticket is available;
3. set `ownerId` to the recipient;
4. set ticket status to `issued`/`owned`;
5. record a giveaway/audit record;
6. return the complete ticket.

Email is optional and must not be required for this operation.

## Persistence

Use a real persistent database (MongoDB Atlas is suitable for the existing Node/Express/Mongoose stack). Do not use an in-memory array or local JSON file on Render for production data.

## Images

For a small prototype, the frontend sends a compressed image data string or multipart `image` field. For production, use persistent object storage and save only the image reference in MongoDB.

## Barcode

The barcode is generated from the server-side ticket code. Never generate a new ticket identity on every page refresh.

The backend should issue a unique immutable `ticketCode`.
