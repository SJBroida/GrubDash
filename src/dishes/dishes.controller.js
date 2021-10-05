const e = require("express");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    res.locals.dish = foundDish;

    if (foundDish) {
      return next();
    }
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}.`,
    });
}

function hasId(req, res, next) {

    const { data: { id } = {} } = req.body;
    
    const dishId = res.locals.dish.id;

    if (!id) {
        return next();
    } else if( id === dishId ) {
        return next();
    }
    
    next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });

}

function hasName(req, res, next) {

    const { data: { name } = {} } = req.body;
    res.locals.name = name;

    if (name) {
        return next();
    }
    
    next({ status: 400, message: "Dish must include a name" });

}

function hasDescription(req, res, next) {

    const { data: { description } = {} } = req.body;
    res.locals.description = description;

    if (description) {
        return next();
    }
    
    next({ status: 400, message: "Dish must include a description" });

}

function hasPrice(req, res, next) {

    const { data: { price } = {} } = req.body;

    const numberCheck = (typeof price === "number");

    if ( price ) {
        if( price >= 0 && numberCheck ) {
            res.locals.price = price;
            return next();
        } else {
            return next ({ status: 400, message: "Dish must have a price that is an integer greater than 0"});
        }
    } else {
        return next({ status: 400, message: "Dish must include a price"});
    }

}

function hasImageUrl(req, res, next) {

    const { data: { image_url } = {} } = req.body;
    res.locals.imageUrl = image_url;

    if (image_url) {
        return next();
    }
    
    next({ status: 400, message: "Dish must include a image_url" });

}

function create(req, res) {
    const newDish = {
      id: nextId(),
      name: res.locals.name,
      description: res.locals.description,
      price: res.locals.price,
      image_url: res.locals.imageUrl,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function list(req, res) {
    res.json({ data: dishes });
}

function read(req, res) {
    res.json({ data: res.locals.dish });
}

function update(req, res) {
    res.locals.dish.name = res.locals.name;
    res.locals.dish.description = res.locals.description;
    res.locals.dish.price = res.locals.price;
    res.locals.dish.image_url = res.locals.imageUrl;
  
    res.json({ data: res.locals.dish });
}

module.exports = {
    create: [hasName, hasDescription, hasPrice, hasImageUrl, create],
    list,
    read: [dishExists, read],
    update: [dishExists, hasId, hasName, hasDescription, hasPrice, hasImageUrl, update],
    dishExists,
};
