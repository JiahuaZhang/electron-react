# Hack

## Infinite reload when developing

Recently, `create-react-app` will reload the application when it detects file changes at `public` folder with this [pull request](https://github.com/facebook/create-react-app/pull/1546). However, for this epub-reader app, it will store all images, stylesheets relating to the epub to `public` folder when it openes a book.

Hence, opening a book => will store its images, stylesheets to `public` folder => `react-scripts` detects update on `public` folder => reload => ...

I tried to store these files inside the `src` folder, but it seems the application can't load them dynamically.

Hence, to workaround this it, change [this line](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js#L62) to `watchContentBase: false` will do the hack.

A better alternative might just do `yarn eject` then update the webpack config.

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
