# Manual Migration Instructions

To apply the database changes for the Availability Management system, please run the following command from the project root directory:

```bash
npx prisma migrate dev --name add_availability_models
```

This will create the necessary database tables for:
- AvailabilityRule (for weekly recurring availability)
- AvailabilityException (for exceptions to regular availability)
- ExceptionTimeSlot (for time slots within exceptions)

It will also add the following fields to the BuilderProfile model:
- timezone (IANA timezone name)
- minimumNotice (minimum minutes before a session can be booked)
- bufferBetweenSessions (minutes between consecutive sessions)
- maximumAdvanceBooking (maximum days in advance a client can book)
- isAcceptingBookings (flag to control whether the builder is accepting bookings)

After running the migration, please run the following command to update the Prisma client:

```bash
npx prisma generate
```
