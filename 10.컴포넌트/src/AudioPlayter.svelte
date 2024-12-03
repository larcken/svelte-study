<script context="module">
  const players = new Set()

  export function stopAll() {
    console.log(players)
    players.forEach(p => p.pause())
  }
  export function startAll() {
    players.forEach(p => p.play())
  }
</script>

<script>
  import {onMount} from 'svelte'

  export let src
  let player

  onMount(() =>{
    // Like players.push(player)
    players.add(player)
  })
</script>

<div>
  <audio
    bind:this={player}
    {src}
    controls>
    <track kind="captions" />
  </audio>
</div>