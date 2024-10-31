const Payments = require("../model/Payments");
const pharmacy = require("../model/Pharmacy");
const DeliveryUser = require("../model/DeliveryUser");
const Orders = require("../model/Orders");
const FcmHelper = require("./FcmHelper");

const moment = require("moment");

module.exports.addPaymentRecord = async (userType, amount, orderId, userId) => {
  try {
    let foundPaymentRecord = await Payments.findOne({
      status: "UNPAID",
      endDate: null,
      userType,
      $or: [{ pharmacyId: userId }, { deliveryUserId: userId }],
      //   startDate: {
      //     $gte: moment().toDate(),
      //   },
    });

    if (foundPaymentRecord) {
      foundPaymentRecord.totalAmount =
        Number(foundPaymentRecord?.totalAmount) * 1 + amount * 1;
      foundPaymentRecord?.orders?.push(orderId);
      foundPaymentRecord?.save();
    } else {
      // create a new record
      await Payments.create({
        status: "UNPAID",
        startDate: moment().toDate(),
        endDate: null,
        userType,
        pharmacyId: userType == "PHARMACY" ? userId : null,
        deliveryUserId: userType == "DELIVERY" ? userId : null,
        totalAmount: amount,
        orders: [orderId],
      });
    }
  } catch (err) {
    console.log("Error", err);
  }
};

module.exports.assignOrders = async () => {
  // todo: find all nearby delivery users

  const orders = await Orders.find({
    orderStatus: "ACCEPTED-BY-USER",
    deliveryUserId: null,
  })
    .sort({ createdAt: "ascending" })
    .populate("pharmacyId");

  for (const orderItem of orders) {
    console.log("orderItem", orderItem);
    const pharmacyUser = await pharmacy.findOne({
      _id: orderItem?.pharmacyId?._id,
    });

    if (pharmacyUser) {
      console.log(
        "pharmacyUser",
        pharmacyUser,
        pharmacyUser?.location?.longitude,
        pharmacyUser?.location?.latitude
      );

      const deliveryUsers = await DeliveryUser.find({
        location: {
          $near: {
            $maxDistance: 15000, //distance in meters
            $geometry: {
              type: "Point",
              coordinates: [
                pharmacyUser?.location?.longitude,
                pharmacyUser?.location?.latitude,
              ],
            },
          },
        },
        isWorking: true,
        fcmToken: { $ne: "" },
        isAssignedDelivery: false,
      });

      console.log("deliveryUsers", deliveryUsers);

      deliveryUsers?.forEach((deliveryUser) => {
        console.log("deliveryUser?.fcmToken", deliveryUser?.fcmToken);

        if (deliveryUser) {
          // FcmHelper.sendNotification(
          //   deliveryUser?.fcmToken,
          //   "Action required",
          //   `Order ${orderItem.orderId} waiting to be delivered.`,
          //   // order
          //   { orderId: String(orderItem._id) }
          // );

          console.log("deliveryUser", deliveryUser);
        }
      });
    } else {
      console.log(
        "pharmacyUser not found when assigning orders. Current pharmacyUser: ",
        pharmacyUser
      );
    }
  }
  console.log("done");
};
