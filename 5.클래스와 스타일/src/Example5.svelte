<div class="box"></div>


<style>
  /* body 태그에 스타일 적용. 정의된 부분이 없기 떄문에 전역화로 설정한다. */
  :global(body) {
    padding: 60px;
  }

  .box {
    width: 100px;
    height: 100px;
    background: tomato;
    border-radius: 10px;
    animation: zoom .4s infinite alternate;
  }

  /* @ At-rules (골뱅이 규칙) */
  /* zoom 이라는 이름의 keyframe을 만들어 낸다. */
  /* -global-zoom과 같이 -global- 을 붙여주면 전역화가 된다. */
  @keyframes -global-zoom {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.5);
    }
  }

  /* 번들 css 에서는 이와같이 생성되어 유효범위를 갖는다. */
  /* @keyframes svelte-2rgv1x-zoom {
    0% {
        transform: scale(1)
    }

    100% {
        transform: scale(1.5)
    }
} */


</style>