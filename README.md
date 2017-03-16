# Cornucopia

### Overview

* Full CRUD REST API utilizing MongoDB and Express, deployed via Heroku

* Community web site for sharing and commenting on recipes

* A place to store your recipes, allowing you to add, modify, or delete recipes; search and view others' recipes; comment on recipes


### Architecture

Error middleware: included a helper file to route all errors to. This module responds with the appropriate status codes and error messages based on the type of error.

### Schemas

#### User

The user schema contains properties that used to verify the user.
  * username - username entered on signup
  * password -  password entered on signup
  * email - email of the user
  * findHash - random encrypted 32 byte string. Used to generate a signed Json Web Token for the user.

  ![image of user schema](https://ibb.co/kJfQka "Profile Schema")


#### Profile

The profile schema includes outward facing properties for a user.

  * userID - Points to the MongoDB id of a profiles corresponding user.
  * name - name of user.
  * profilePicURI - URI of a users profile picture, pointing to AWS bucket.
  * recipes - array of recipe id's created when saved to mongoDB, used to create a relationship between a profile and their recipes.
  * comments - array of comment id's created when saved to mongoDB, used to create a relationship between a profile and their comments.
  * upvotes - array of upvote id's created when saved to mongoDB, links a profile to up/downvotes on a recipe.

  ![image of profile schema](https://ibb.co/dCkrQa "Profile Schema")

#### Recipe

The recipe schema includes properties for the actual recipe content.
  * profileID - Points to the mongoDB id of the profile that created the recipe.
  * ingredients - List ingredients in a recipe.
  * instructions - Step by step directions for the recipe.
  * picURI -  URI of any pictures of the recipe, points to the AWS buckets.
  * categories - What type of dish the recipe is.
  * comments - array of comment id's created when saved to mongoDB, used to create a relationship between a recipe and comments posted on it.
  * upvotes - array of upvote id's created when saved to mongoDB, used to create a relationship  between a recipe and the up/downvotes associated.
  * created - created on date, automatically instantiated on creation of a recipe.

  ![image of recipe schema](https://ibb.co/fWPUBF "Profile Schema")
#### Comment

The comment schema includes properties for the actual recipe content.

  * commenterProfileID - Points to the mongoDB id of the profile that posted the comment.
  * recipeID - Points to the mongoDB id of the recipe the comment is attached to.
  * comment - Comment, created by a user to be posted on a recipe.
  * created - created on date, automatically instantiated on creation of a recipe.

  ![image of comment schema](https://ibb.co/bFE7yv "Profile Schema")

### Routes

#### User

Authentication for POST routes using Basic Authorization middleware

```
POST '/api/signup'
```
Required data: request body including the following fields: email, username , password.

Route creates a new user account by signing up with the given required information.

```
GET '/api/signin'
```

Required data: request authorization including username and password.

Route signs in to an already existing user account.


#### Recipe

Authorization and authentication for POST, DELETE and PUT routes: included Bearer Authorization middleware using jsonwebtoken (generated during User sign-in);

```
POST: '/api/recipe'
```

Required data: request body including the following fields: ingredients, instructions, categories.

Route creates a new recipe based on user input and references it in the user's profile Schema.

```
GET: '/api/recipe/:id'
```

Required data: recipe id in request params object.

Route fetches the recipe requested. Does not need authentication or authorization since recipes should be accessible by all users.

```
GET: '/api/recipe/:profileID'
```

Required data: profileID in request params object.

Route fetches all of a profile's recipes. Does not need authentication or authorization since recipes should be accessible by all users.

```
DELETE: '/api/recipe/:id'
```

Required data: recipe id in request params object.

Deletes a single recipe given a recipe id by the user. Also removes the recipe ID from the profile recipes property.


```
PUT: '/api/recipe/:id'
```

Required data: Recipe id and body containing updates in the request params object.

Updates a single recipe or part of a recipe.


##### Created by Braelynn Luedtke, Noah Gribbin, Khalid Mohamud, and Yana Radenska
