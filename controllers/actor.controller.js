const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const { Actor } = require('../models/actors.model');
const { Movie } = require('../models/movies.model');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const { filterObj } = require('../utils/filterObj');
const { storage } = require('../utils/firebase');

exports.getAllActors = catchAsync(async (req, res, next) => {
  const actors = await Actor.findAll({
    where: { status: 'active' },
    include: [{ model: Movie}]
  });

  //console.log(user);
  //if(!review){
  if (actors.length === 0) {
    return next(new AppError(404, 'There are not actors until'));
  }

  // Promise[]
  const actorPromises = actors.map(
    async ({
      id,
      name,
      country,
      rating,
      age,
      profilePic,
      createdAt,
      updatedAt,
      movies
    }) => {
      const imgRef = ref(storage, profilePic);

      const imgDownloadUrl = await getDownloadURL(imgRef);

      return {
        id,
        name,
        country,
        rating,
        age,
        profilePic: imgDownloadUrl,
        createdAt,
        updatedAt,
        movies
      };
    }
  );

  const resolvedActors = await Promise.all(actorPromises);

  res.status(201).json({
    status: 'success',
    data: {
      actor: resolvedActors
    }
  });
});

exports.getActorsById = catchAsync(async (req, res, next) => {
  const { actor } = req
  res.status(200).json({
    status: 'success',
    data: {
      actor
    }
  });
});
exports.createActor = catchAsync(async (req, res, next) => {
  const { name, country, rating, age, profilePic } = req.body;
  if (
    !name ||
    !country ||
    !rating ||
    !age
    //||!profilePic
  ) {
    return next(new AppError(404, 'Verify the properties and their content'));
  }

  // Upload img to Cloud Storage (Firebase)
  const imgRef = ref(storage, `imgs/${Date.now()}-${req.file.originalname}`);

  const result = await uploadBytes(imgRef, req.file.buffer);

  const actor = await Actor.create({
    name: name,
    country: country,
    rating: rating,
    age: age,
    profilePic: result.metadata.fullPath
  });

  res.status(200).json({
    status: 'success',
    data: {
      actor
    }
  });
});

exports.updateActor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = filterObj(
    req.body,
    'name',
    'country',
    'rating',
    'age',
    'profilePic'
  );

  const actor = await Actor.findOne({
    where: { id: id, status: 'active' }
  });

  if (!actor) {
    return next(
      new AppError(400, 'Must provide a valid the propeties names correctly')
    );
  }

  await actor.update({ ...data });
  res.status(201).json({
    status: 'success',
    message: `The actor with id ${actor.id} was update correctly`
  });
});

exports.deleteActor = catchAsync(async (req, res, next) => {
  const { actor } = req
  
  await actor.update({ status: 'deleted' });
  res.status(201).json({
    status: 'success',
    message: `The Id ${actor.id} was deleted correctly`
  });
});
