//declare variables
const meals = document.getElementById("meals");
const recipeWindow = document.getElementById("pop-window");
const displayRecipe = document.getElementById("display-recipe");
const favoriteGroup = document.getElementById("fav-meals");
const searchWord = document.getElementById("search-word");
const searchBtn = document.getElementById("search");
const closeBtn = document.getElementById("close");

getRandomMeal();
favoriteMeals();

async function getRandomMeal() {
    const respRand = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respRanData = await respRand.json();
    const randomMeal = respRanData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal, true);
};
async function getMealById(id) {
    const respById = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const respByIdData = await respById.json();
    const mealById = respByIdData.meals[0];
    return mealById;
};
async function getMealBySearch(name) {
    const respByName = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + name);
    const respByNameData = await respByName.json();
    const mealByName = respByNameData.meals;
    return mealByName;
};

function addMeal(mealData, random = false) {
    console.log("mealData: ", mealData);
    const meal = document.createElement("div");
    meal.classList.add("meal");
    meal.innerHTML = `
        <div class="meal-header">
            ${
                random ? `
            <span class="random"> Random Recipe </span> `
            : ""
            }
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <img class="empty" src=""></img>
            </button>
        </div>
    `;
    meal.addEventListener("click", () => {
        displayRecipeInfo(mealData);
    });
    meals.appendChild(meal);
};
function addFavoritesToLocalStorage(favmeal) {
    const mealID = getFavoritesFromLocalStorage();
    localStorage.setItem("mealid", JSON.stringify([...mealID, favmeal]));
};
function removeFavoritesFromLocalStorage(favmeal) {
    const mealID = getFavoritesFromLocalStorage();
    localStorage.setItem("mealid", JSON.stringify(mealID.filter(id => id !== favmeal)));
};
function getFavoritesFromLocalStorage() {
    //we get item by key("mealid") from local storage. 
    const mealID = JSON.parse(localStorage.getItem("mealid"));
    return mealID === null ? [] : mealID;
};

async function favoriteMeals() {
    favoriteGroup.innerHTML = "";
    const mealID = getFavoritesFromLocalStorage();
    // const favMealsGroup = [];
    for(let i = 0; i < mealID.length; i++){
        const meals = mealID[i];
        const meal = await getMealById(meals);
        addMealToFavorites(meal);
        // favMealsGroup.push(meal);
    }
    // console.log("favMealsGroup: ", favMealsGroup);
    //display meals in the browser
};
function addMealToFavorites(mealData) {
    console.log("mealData on addMealFavorites: ", mealData);
    const favoriteMeal = document.createElement("li");
    favoriteMeal.innerHTML = `
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>
        ${mealData.strMeal}
        </span>
        `;
    favoriteMeal.addEventListener("click", () => {
        displayRecipeInfo(mealData);
    });
    favoriteGroup.appendChild(favoriteMeal);
};

function displayRecipeInfo(mealData){
    displayRecipe.innerHTML = "";
    const recipeFullInfo = document.createElement("div");
    const ingredientsList = [];
    //get the ingredients and measures
    for(let i = 1; i <= 20; i++) {
        if(mealData["strIngredient" + i]) {
            ingredientsList.push(`
            <strong>
                ${mealData["strIngredient" + i]} :
            </strong>
            ${mealData["strMeasure" + i]}
            `)
        } else {
            break;
        }
        // console.log("myIngredients: ", ingredientsList);
    };
    recipeFullInfo.innerHTML = `
        <h3><strong>${mealData.strMeal}</strong></h3>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" style="">
        <p>${mealData.strInstructions}</p>
        <h5><strong> Ingredients & Measures </strong></h5>
        <ul>
            ${ingredientsList.map((ing) => `
                <li>${ing}</li> `
            ).join("")}
        </ul>
        <br>
        <button class="add">Add to Favorites</button>
        <button class="delete">Delete from favorites</button>
    `;
    displayRecipe.appendChild(recipeFullInfo);
    recipeWindow.classList.remove("hidden");
    const deleteBtn = recipeFullInfo.querySelector(".delete");
    deleteBtn.addEventListener("click", () => {
        removeFavoritesFromLocalStorage(mealData.idMeal);
        favoriteMeals();
        recipeWindow.classList.add("hidden");
    });
    const addBtn = recipeFullInfo.querySelector(".add");
    addBtn.addEventListener("click", ()=> {
        addFavoritesToLocalStorage(mealData.idMeal);
        favoriteMeals();
        recipeWindow.classList.add("hidden");
    })
};

searchBtn.addEventListener("click", async() => {
    meals.innerHTML="";
    const search = searchWord.value;
    const listByName = await getMealBySearch(search);
    console.log("recipe by name results: ", listByName);
    if(listByName) {
        listByName.forEach((recipe) => {
            addMeal(recipe);
        });
    }
});

closeBtn.addEventListener("click", () => {
    recipeWindow.classList.add("hidden");
});

