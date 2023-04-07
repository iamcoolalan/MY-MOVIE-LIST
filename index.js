"use strict"

const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const PER_PAGE_INDEX = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {

  let rawHTML = ''

  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <!-- card footer(2button) model  -->
            <div class="card-footer text-muted">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })

  dataPanel.innerHTML = rawHTML

}

function showMovieModal(id) {

  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-model-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results

      modalTitle.innerText = data.title
      modalDate.innerText = "Release date: " + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
        <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })

}


function renderPaginator(amount) {

  const pages = Math.ceil(amount / PER_PAGE_INDEX)

  let rawHTML = ''

  for (let page = 1; page <= pages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  paginator.innerHTML = rawHTML
}

function getMovieByPage(page) {
  
  let data = filteredMovies.length ? filteredMovies : movies
  const startPage = (page - 1) * PER_PAGE_INDEX

  return data.slice(startPage, startPage + PER_PAGE_INDEX)


}



axios.get(INDEX_URL)
  .then((response) => {
    /* 方法一:用for-of迴圈，將每一筆資料一一存入矩正中 */
    // for(const movie of response.data.results){
    //   movies.push(movie)
    // }

    /*方法二: 使用展開運算子 ... */
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1))

  })
  .catch((err) => {
    console.log(err)
  })

function addToFavorite(id) {
  //使用||，來回傳true的結果
  //這段程式的意思，如果有'favoriteMovie'資料就回傳給我，如果沒有就給我空的矩正吧
  //JSON.parse將json格式轉成物件
  const list = JSON.parse(localStorage.getItem('favoriteMovie')) || []

  //一但找到符合條件的項目，函式馬上終止並回傳匹配的結果
  const movie = movies.find(movie => movie.id === id)

  //some方法
  //如果矩陣中包含該條件，就回傳true反之回傳false
  if (list.some(movie => movie.id === id)) {
    return alert('The movie is already in list')
  }

  list.push(movie)
  //JSON.stringify將物件轉成json格式
  localStorage.setItem('favoriteMovie', JSON.stringify(list))

}


dataPanel.addEventListener('click', function showMovieModel(event) {

  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  const page = event.target.dataset.page
  renderMovieList(getMovieByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //preventDefault 方法， 防止瀏覽器做預設行為
  //此案例中，submit事件中預設會重新整理頁面 
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    renderMovieList(movies)
    return alert('Please enter valid value')
  }

  //方法一 for-of迴圈
  // for(const movie of movies){
  //   if (movie.title.toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  //方法二 filter
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`The keyword: ${keyword} could not be found`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))

})