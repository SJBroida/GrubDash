const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function orderExists(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);

    res.locals.order = foundOrder;

    if (foundOrder) {
      return next();
    }
    next({
      status: 404,
      message: `Order ID not found: ${req.params.orderId}`,
    });
}

function hasId(req, res, next) {

    const { data: { id } = {} } = req.body;
    
    const orderId = res.locals.order.id;

    if (!id) {
        return next();
    } else if( id === orderId ) {
        return next();
    }
    
    next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.` });

}

function hasDeliverTo(req, res, next) {

    const { data: { deliverTo } = {} } = req.body;
    res.locals.deliverTo = deliverTo;

    if (deliverTo) {
        return next();
    }
    
    next({ status: 400, message: "A 'deliverTo' property is required." });

}

function hasMobileNumber(req, res, next) {

    const { data: { mobileNumber } = {} } = req.body;
    res.locals.mobileNumber = mobileNumber;

    if (mobileNumber) {
        return next();
    }
    
    next({ status: 400, message: "A 'mobileNumber' property is required." });

}

function hasDishes(req, res, next) {

    const { data: { dishes } = {} } = req.body;
    res.locals.dishes = dishes;

    if ( dishes ) {
        if (Array.isArray(dishes)) {
            if( dishes.length !== 0) {
                return next();
            }
        }
        
    }

    next({ status: 400, message: "A 'dishes' property is required." });

}

function hasQuantity(req, res, next) {

    const dishes = res.locals.dishes;

    let badIndex = 0;

    const quantities = dishes.map((theDish, index) => {
        const theQuantity = theDish.quantity;
        if(typeof theQuantity === "number" && theQuantity > 0) {
            return true;
        } else {
            badIndex = index;
            return false;
        }
    });

    if ( quantities.every( (entry) => entry === true ) ) {
        return next();
    }
    
    next({ status: 400, message: `Dish ${badIndex} must have a quantity that is an integer greater than 0`});

}

function hasStatus(req, res, next) {

	const { data: { status = {} } } = req.body;

	if (!status || status === "") {
		//adding status strings fails tests
		next({
			status: 400,
			message: `A delivered order cannot be changed; must have a different status`,
		});
	}

	if (status === "delivered") {
		next({
			status: 400,
			message: "A delivered order cannot be changed",
		});
	}

	const validStatuses = ["pending", "preparing", "out-for-delivery"];
	if (!validStatuses.includes(status)) {
		return next({
			status: 400,
			message: `Order must have a status of pending, preparing, out-for-delivery, or delivered`,
		});
	}

    res.locals.order.status = status;
  
	next();
}

function create(req, res) {

    const newOrder = {
      id: nextId(),
      deliverTo: res.locals.deliverTo,
      mobileNumber: res.locals.mobileNumber,
      status: "pending",
      dishes: res.locals.dishes,
    };
    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    orders.splice(index, 1);
    res.sendStatus(204);
}

function list(req, res) {
    res.json({ data: orders });
}

function read(req, res) {
    res.json({ data: res.locals.order });
}

function update(req, res) {
    res.locals.order.deliverTo = res.locals.deliverTo;
    res.locals.order.mobileNumber = res.locals.mobileNumber;
    res.locals.order.dishes = res.locals.dishes;

    res.json({ data: res.locals.order });
}

function isPending(req, res, next) {
  
  if( res.locals.order.status === "pending") {
    return next();
  }
  
  next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
}

module.exports = {
    create: [hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, create],
    delete: [orderExists, isPending, destroy],
    list,
    read: [orderExists, read],
    update: [orderExists, hasId, hasDeliverTo, hasMobileNumber, hasDishes, hasQuantity, hasStatus, update],
};