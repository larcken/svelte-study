<script>
  function clickHandler(event) {
    // console.log(event.target)
    console.log(event.currentTarget)    
  }
  function wheelHandler(event) {
    console.log(event)
  }

</script>


<section>
    <!-- 기본 동작 방지 -->
     <!-- a태그 동작하는것을 preventDefault 가 방지하게 됨 -->
    <h2>preventDefault</h2>
    <a href="https://naver.com"
        target="_blank"
        on:click|preventDefault={clickHandler}>
        Naver
    </a>
</section>


<section>
    <!-- 최소 실행 후 핸들러 삭제 -->
     <!-- 이벤트 수식어를 두개 작성, chain형태로 필요에 따라 여러개 사용할 수 있음
     preventDefault 기본 동작을 방지하고 once 최초 한번만 수행한다. -->
    <h2>Once</h2>
    <a href="https://naver.com"
        target="_blank"
        on:click|preventDefault|once={clickHandler}>
        Naver
    </a>
</section>


<section>
    <!-- 이벤트 버블링 방지 -->
     <!-- child를 클릭해도 parent도 클릭하는것이기 때문에 child와 parent 모두 클릭하는 이벤트 버블이 발생 -->
     <!-- stopPropagation 는 부모요소로 이벤트가 넘어가는것을 방지해서 이벤트 버블을 방지한다. -->
     <h2>stopPropagation</h2>
     <div class="parent" on:click={clickHandler}>
        <div class="child" on:click|stopPropagation={clickHandler}></div>
     </div>
</section>

<section>
    <!-- 캡쳐링에서 핸들러 실행 -->
     <!-- child를 선택했지만 capture를 통해 parent가 먼저 수행되고 child가 수행됨 -->
     <h2>capture</h2>
     <div class="parent" on:click|capture={clickHandler}>
        <div class="child" on:click={clickHandler}></div>
     </div>
</section>


<section>
    <!-- event의 target과 currentTarget이 일치하는 경우 핸들러 실행 -->
     <!-- parent만 클릭했을때 동작함 -->
     <h2>self</h2>
     <div class="parent" on:click|self={clickHandler}>
        <div class="child"></div>
     </div>
</section>

<section>
    <!-- 이벤트 처리를 완료하지 않고도 기본 속도로 화면을 스크롤 -->
     <!-- passive 이벤트 속성이 들어가면 기본적인 이벤트 처리랑 상관없이 브라우저의 기본 속도로 화면을 스크롤이 되게 됨 -->
     <h2>passive</h2>
     <div class="parent wheel" on:wheel|passive={wheelHandler}>
        <div class="child"></div>
     </div>
</section>


<style>
    section {
        border: 1px solid orange;
        padding: 10px;
        margin-bottom: 10px;
    }
    .parent {
        width: 100px;
        height: 100px;
        background-color: blue;
    }
    .child {
        width: 50px;
        height: 50px;
        background-color: red;
    }
    .wheel.parent {
        overflow: auto;
    }
    .wheel .child {
        height: 1000px;
    }
</style>