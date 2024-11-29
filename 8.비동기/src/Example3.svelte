<script>
    import axios from 'axios'

    // omdb 사이트에 발급받은 api key
    let apikey = "77d38320";
    let title = "";
    let movies = null;
    let error = null;
    let loading = false;

    async function searchMovies() {
        // loading 중에는 다시 실행되지 않도록 함
        if (loading) {
            return;
        }
        movies = null;
        error = null;
        loading = true;
        try {
            const res = await axios.get(`http://www.omdbapi.com/?apikey=${apikey}&s=${title}`)
            console.log(res)
            movies = res.data.Search;
        } catch(e) {
            error = e;
        } finally {
            loading = false;
        }
    }

</script>

<input bind:value={title} />
<button on:click={searchMovies}>검색!</button>

{#if loading}
    <p style='color: royalblue'>Loading...</p>
{:else if movies}
    <ul>
        {#each movies as movie}
            <li>{movie.Title}</li>
        {/each}
    </ul>
{:else if error}
    <p style='color:red;'>{error.message}</p>
{/if}
