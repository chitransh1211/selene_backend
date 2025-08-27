// middleware/validateVisitor.js
import { body, validationResult } from "express-validator";
export const validateVisitor = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('purposeOfVisit').notEmpty().withMessage('Purpose of visit is required'),
  body('organisation').notEmpty().withMessage('Organisation is required'),
  body('visitType').notEmpty().withMessage('Purpose of visit is required'),
  body('timeSlot.startTime').isISO8601().toDate().withMessage('Valid start time is required'),
  body('timeSlot.endTime').isISO8601().toDate().withMessage('Valid end time is required'),
  body('timeSlot').custom(({ startTime, endTime }) => {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new Error('End time must be after start time');
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
