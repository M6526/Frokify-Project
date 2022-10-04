import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './view/recipeView.js';
import searchView from './view/searchView.js';
import resultView from './view/resultView.js';
import paginationView from './view/paginationView.js';
import bookmarksView from './view/bookmarksView';
import addRecipeView from './view/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
// if (module.hot) {
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();
    // 0) Update result veiw to mark selected search result
    resultView.update(model.getSearchResultPage());
    // 1) Updating the BookMark
    bookmarksView.update(model.state.bookmarks);
    // 1 Loading Recipe:
    await model.loadRecipe(id);

    // 2 Rendering Recipe:
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};
const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();

    // 1) Get search query:
    const query = searchView.getQuery();
    if (!query) return;
    // 2) Load search Result:
    await model.loadSearchResults(query);
    // 3) Render Result:

    // resultView.render(model.state.search.results);
    resultView.render(model.getSearchResultPage(3));
    // 4) Render Intial pagination result:
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPagination = function (goToPage) {
  // 3) Render New pagination results:
  resultView.render(model.getSearchResultPage(goToPage));
  // 4) Render New Pagination buttons:
  paginationView.render(model.state.search);
};
const controlServings = function (newServings) {
  // Udate the recipe serving in the (state)
  model.updateServings(newServings);
  //  Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};
const controlAddBookmark = function () {
  // 1) Add/ Remove BookMark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  // 2) Update recipe View
  recipeView.update(model.state.recipe);
  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading Spinner
    addRecipeView.renderSpinner();
    // Uplaod the new Recipe Data:
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    // Render Recipe:
    recipeView.render(model.state.recipe);
    // Sucess Message
    addRecipeView.renderMessage();
    // Render Bookmark View:
    bookmarksView.render(model.state.bookmarks);
    // Change ID in the URL:
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close form window:
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('####', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpadateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.getHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome');
};
init();
