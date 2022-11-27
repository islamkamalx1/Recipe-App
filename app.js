const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealInfoEl = document.getElementById("meal-info");
const mealPopup = document.getElementById("meal-popup");
const closePopup = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

// *GET RANDOM MEAL*
async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const resData = await res.json();
  const randomMeal = resData.meals[0];
  // console.log(randomMeal);
  addMeal(randomMeal, true);
}

// *GET MEAL BY ID*
async function getMealById(id) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );
  const resData = await res.json();
  const meal = resData.meals[0];
  return meal;
}

// *GET MEAL BY SEARCH*
async function getMealsBySearch(term) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );
  const resData = await res.json();
  const meals = resData.meals;
  return meals;
}

// *Add Random Meal To Screen*
function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `
          <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ""}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
              <i class="fas fa-heart"></i>
            </button>
          </div>`;

  const favIcon = meal.querySelector(".fa-heart");
  const btn = meal.querySelector(".meal-body .fav-btn");
  
  btn.addEventListener("click", (e) => {
    // console.log(e.target === btn || e.target === favIcon);
    if (btn.classList.contains("active")) {
      removeMealFromLs(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealToLS(mealData.idMeal);
      btn.classList.add("active");
    }
    fetchFavMeals();
  });

  meal.addEventListener("click", (e) => {
    // console.log(e.target);
    if (e.target === btn || e.target === favIcon) {
      return;
    } else {
      showMealInfo(mealData);
    }
  });
  
  mealsEl.appendChild(meal);
}

// *Add Meal To Local Storage*
function addMealToLS(mealId) {
  const mealIds = getMealsFromLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// *Remove Meal From Local Storage*
function removeMealFromLs(mealId) {
  const mealIds = getMealsFromLS();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

// *Get Meals From Local Storage*
function getMealsFromLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // *Clean The Container*
  favoriteContainer.innerHTML = "";

  const mealIds = getMealsFromLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealById(mealId);
    addMealFav(meal);
  }
  // ToDo: add them to the screen
}

// *Add Meal To Favorite*
function addMealFav(mealData) {
  const favMeal = document.createElement("li");
  favMeal.innerHTML = `
  <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
  <span>${mealData.strMeal}</span>
  <button class="clear"><i class="fas fa-window-close"></i></button>`;
  const favCloseIcon = favMeal.querySelector(".fa-window-close");
  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealFromLs(mealData.idMeal);
    fetchFavMeals();
  });

  favMeal.addEventListener("click", (e) => {
    if (e.target === btn || e.target === favCloseIcon) {
      return;
    } else {
      showMealInfo(mealData);
    }
  });

  favoriteContainer.appendChild(favMeal);
}

// *Show Meal Info (popup)*
function showMealInfo(mealData) {
  // *Clean it up*
  mealInfoEl.innerHTML = "";

  // *Update meal info*
  const mealEl = document.createElement("div");

  // *Get ingredients and measure*
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]} `
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
          <h1>${mealData.strMeal}</h1>
          <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
          <p>
           ${mealData.strInstructions}
          </p>
          <h3>Ingredients:</h3>
          <ul>
            ${ingredients
              .map(
                (ing) =>
                  `
              <li>${ing}</li>
              `
              )
              .join("")}
          </ul>
          `;

  mealInfoEl.appendChild(mealEl);

  // *Show the popup*
  mealPopup.classList.remove("hidden");
}


searchBtn.addEventListener("click", async () => {
  // *Clear The Container*
  mealsEl.innerHTML = "";
  const search = searchTerm.value;
  console.log(search);
  const meals = await getMealsBySearch(search);

  if (meals && search) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});

closePopup.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
