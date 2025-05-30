const Joi = require('joi');

// Token Booking Validation Schema
exports.validateTokenBooking = (data) => {
  const schema = Joi.object({
    propertyId: Joi.string().required(),
    tokenAmount: Joi.number().required().min(0),
    bookingType: Joi.string().valid('rent', 'sale').required(),
    duration: Joi.number().when('bookingType', {
      is: 'rent',
      then: Joi.number().required().min(1),
      otherwise: Joi.number().optional()
    }),
    paymentMethod: Joi.string().valid('online', 'cash', 'bank_transfer').required(),
    notes: Joi.string().allow('').optional()
  });

  return schema.validate(data);
};
