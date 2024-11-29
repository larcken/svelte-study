<script>
  import axios from 'axios'

  // omdb 사이트에 발급받은 api key
  let apikey = "77d38320";
  let title = "";
  // let promise = new Promise(resolve => resolve([]))
  let promise = Promise.resolve([])

  // async는 await가 존재하는 함수에 존재해야함
  // Promise 사용 할때 async의 위치를 잘 확인하자.
  function searchMovies() {
    return new Promise(async (resolve, reject) => {
      try {
          const res = await axios.get(`http://www.omdbapi.com/?apikey=${apikey}&s=${title}`)
          console.log(res.data.Error)
          console.log(res)
          if(res.data.Error !== undefined) {
            let error = {message : res.data.Error}
            reject(error)
          } else {
            resolve(res.data.Search)
          }
      } catch(e) {
          reject(e)
      } finally {
          console.log('Done!')
      }
    })
  }

</script>

<input bind:value={title} />
<button on:click={() => {
  promise = searchMovies()
}}>검색!</button>

{#await promise}
<p style='color: royalblue'>Loading...</p>
{:then movies}
  <ul>
    {#each movies as movie}
        <li>{movie.Title}</li>
    {/each}
  </ul>
{:catch error}
  <p style='color:red;'>{error.message}</p>
{/await}

<!-- {#if loading}
  <p style='color: royalblue'>Loading...</p>
{:else if movies}
  <ul>
      {#each movies as movie}
          <li>{movie.Title}</li>
      {/each}
  </ul>
{:else if error}
  <p style='color:red;'>{error.message}</p>
{/if} -->
