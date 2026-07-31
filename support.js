<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="_ds/nocturne-051dcd63-f3ca-45d6-ae9a-9a1f4cd377dc/styles.css">
<script src="_ds/nocturne-051dcd63-f3ca-45d6-ae9a-9a1f4cd377dc/_ds_bundle.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap">
<style>
html,body{height:100%;margin:0}
@keyframes noc-drift-a{0%{transform:translate3d(-6%,-4%,0) scale(1)}50%{transform:translate3d(8%,6%,0) scale(1.18)}100%{transform:translate3d(-6%,-4%,0) scale(1)}}
@keyframes noc-drift-b{0%{transform:translate3d(6%,5%,0) scale(1.1)}50%{transform:translate3d(-9%,-7%,0) scale(0.92)}100%{transform:translate3d(6%,5%,0) scale(1.1)}}
@keyframes noc-breathe{0%,100%{opacity:.42}50%{opacity:.9}}
@keyframes noc-twinkle{0%,100%{opacity:.35}50%{opacity:.95}}
@keyframes noc-sweep{0%{transform:translateY(-40%)}100%{transform:translateY(140%)}}
@keyframes noc-halo{0%,100%{opacity:.30;transform:scale(1)}50%{opacity:.62;transform:scale(1.045)}}
@keyframes noc-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes noc-tick{0%{opacity:.25}50%{opacity:1}100%{opacity:.25}}
@keyframes noc-float-up{0%{transform:translate3d(0,110%,0);opacity:0}12%{opacity:.75}70%{opacity:.5}100%{transform:translate3d(14px,-20%,0);opacity:0}}
@keyframes noc-float-up-b{0%{transform:translate3d(0,110%,0);opacity:0}18%{opacity:.6}100%{transform:translate3d(-22px,-25%,0);opacity:0}}
@keyframes noc-curtain{0%{transform:translate3d(-14%,0,0) skewX(-12deg) scaleY(1)}50%{transform:translate3d(12%,-6%,0) skewX(10deg) scaleY(1.28)}100%{transform:translate3d(-14%,0,0) skewX(-12deg) scaleY(1)}}
@keyframes noc-curtain-b{0%{transform:translate3d(10%,4%,0) skewX(14deg) scaleY(1.18)}50%{transform:translate3d(-16%,-4%,0) skewX(-8deg) scaleY(0.86)}100%{transform:translate3d(10%,4%,0) skewX(14deg) scaleY(1.18)}}
@keyframes noc-star-drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-40px,0)}}
@keyframes noc-shoot{0%{transform:translate3d(-60px,-40px,0) rotate(28deg);opacity:0}4%{opacity:.9}16%{transform:translate3d(300px,190px,0) rotate(28deg);opacity:0}100%{opacity:0}}
@keyframes noc-grid-run{from{background-position:0 0,0 0}to{background-position:0 34px,0 0}}
@keyframes noc-drop{0%{transform:translate3d(0,-160px,0);opacity:0}10%{opacity:.85}90%{opacity:.5}100%{transform:translate3d(0,900px,0);opacity:0}}
@keyframes noc-horizon-glow{0%,100%{opacity:.5}50%{opacity:.9}}
@keyframes noc-rain{from{background-position:0 -280px}to{background-position:0 280px}}
@keyframes noc-ripple{0%{transform:scale(.35);opacity:0}18%{opacity:.55}100%{transform:scale(1.6);opacity:0}}
</style>
</helmet>
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 24px;background:radial-gradient(ellipse 70% 60% at 50% 40%, #1f2130, #101120 70%);font-family:var(--font-body)">
<x-import component-from-global-scope="IOSDevice" from="./ios-frame.jsx" dark="true" hint-size="402px,874px">

  <div style="position:relative;height:874px;overflow:hidden;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body)">

    <sc-if value="{{ bgAurora }}" hint-placeholder-val="{{ true }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 90% 55% at 50% 8%, #23263c, transparent 70%)"></div>
        <div style="position:absolute;left:-30%;top:6%;width:160%;height:44%;filter:blur(44px);opacity:.34;background:linear-gradient(100deg, transparent 8%, #423a6a 30%, #4c5397 50%, #2b2741 68%, transparent 90%);mask-image:linear-gradient(to bottom, transparent, #000 40%, #000 62%, transparent),repeating-linear-gradient(96deg, #000 0 34px, rgba(0,0,0,.55) 34px 88px);mask-composite:intersect;-webkit-mask-image:linear-gradient(to bottom, transparent, #000 40%, #000 62%, transparent),repeating-linear-gradient(96deg, #000 0 34px, rgba(0,0,0,.55) 34px 88px);-webkit-mask-composite:source-in;animation:noc-curtain 26s ease-in-out infinite"></div>
        <div style="position:absolute;left:-24%;top:18%;width:150%;height:40%;filter:blur(52px);opacity:.26;background:linear-gradient(84deg, transparent 12%, #2b2741 32%, #5d5294 52%, #262a60 72%, transparent 92%);mask-image:linear-gradient(to bottom, transparent, #000 46%, transparent),repeating-linear-gradient(88deg, #000 0 46px, rgba(0,0,0,.45) 46px 120px);mask-composite:intersect;-webkit-mask-image:linear-gradient(to bottom, transparent, #000 46%, transparent),repeating-linear-gradient(88deg, #000 0 46px, rgba(0,0,0,.45) 46px 120px);-webkit-mask-composite:source-in;animation:noc-curtain-b 38s ease-in-out infinite"></div>
        <div style="position:absolute;left:-10%;bottom:-14%;width:120%;height:44%;filter:blur(60px);opacity:.5;background:radial-gradient(ellipse 60% 70% at 40% 60%, #2b2741, transparent 72%);animation:noc-drift-b 46s ease-in-out infinite"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 66% 40% at 50% 44%, rgba(22,24,38,0.72), transparent 76%)"></div>
      </div>
    </sc-if>

    <sc-if value="{{ bgStars }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 30% 18%, #2b2741, transparent 68%),radial-gradient(ellipse 70% 44% at 78% 74%, #262a60, transparent 70%);opacity:.75"></div>
        <div style="position:absolute;inset:-8% 0;opacity:.95;background-image:radial-gradient(1.5px 1.5px at 12% 18%,#f3f5fe,transparent),radial-gradient(1.7px 1.7px at 44% 11%,#e4e7f5,transparent),radial-gradient(1.6px 1.6px at 71% 33%,#d2cefd,transparent),radial-gradient(1.5px 1.5px at 88% 63%,#e7e5fe,transparent),radial-gradient(1.6px 1.6px at 25% 84%,#f3f5fe,transparent),radial-gradient(1.5px 1.5px at 62% 92%,#d2cefd,transparent);animation:noc-twinkle 6s ease-in-out infinite,noc-star-drift 90s linear infinite alternate"></div>
        <div style="position:absolute;inset:-8% 0;opacity:.6;background-image:radial-gradient(1.1px 1.1px at 19% 41%,#cfd3e5,transparent),radial-gradient(1.2px 1.2px at 33% 65%,#b2b6ca,transparent),radial-gradient(1px 1px at 52% 27%,#b5abfc,transparent),radial-gradient(1.2px 1.2px at 77% 88%,#cfd3e5,transparent),radial-gradient(1px 1px at 92% 21%,#b2b6ca,transparent),radial-gradient(1.1px 1.1px at 6% 72%,#9397ab,transparent),radial-gradient(1px 1px at 58% 55%,#b2b6ca,transparent);animation:noc-twinkle 10s ease-in-out infinite reverse,noc-star-drift 140s linear infinite alternate-reverse"></div>
        <div style="position:absolute;inset:-8% 0;opacity:.35;background-image:radial-gradient(0.9px 0.9px at 8% 30%,#9397ab,transparent),radial-gradient(0.8px 0.8px at 29% 49%,#75798c,transparent),radial-gradient(0.9px 0.9px at 47% 74%,#9397ab,transparent),radial-gradient(0.8px 0.8px at 66% 16%,#75798c,transparent),radial-gradient(0.9px 0.9px at 82% 44%,#9397ab,transparent),radial-gradient(0.8px 0.8px at 96% 82%,#75798c,transparent)"></div>
        <div style="position:absolute;left:8%;top:16%;width:84px;height:1.2px;border-radius:1px;background:linear-gradient(90deg, transparent, #e7e5fe);animation:noc-shoot 13s ease-in infinite 4s"></div>
        <div style="position:absolute;left:52%;top:6%;width:62px;height:1px;border-radius:1px;background:linear-gradient(90deg, transparent, #d2cefd);animation:noc-shoot 21s ease-in infinite 11s"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 38% at 50% 44%, rgba(22,24,38,0.62), transparent 74%)"></div>
      </div>
    </sc-if>

    <sc-if value="{{ bgGrid }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;left:0;right:0;top:0;height:62%;background:linear-gradient(to bottom, #161826 30%, rgba(43,39,65,0.55))"></div>
        <div style="position:absolute;left:0;right:0;top:calc(62% - 120px);height:240px;background:radial-gradient(ellipse 46% 42% at 50% 50%, rgba(145,132,217,0.22), rgba(145,132,217,0.07) 55%, transparent 78%);animation:noc-horizon-glow 7s ease-in-out infinite"></div>
        <div style="position:absolute;inset:0;perspective:260px;perspective-origin:50% 62%">
          <div style="position:absolute;left:-60%;right:-60%;top:62%;bottom:-60%;transform:rotateX(70deg);transform-origin:50% 0;background-image:linear-gradient(to bottom, rgba(145,132,217,0.5) 1px, transparent 1px),linear-gradient(to right, rgba(145,132,217,0.34) 1px, transparent 1px);background-size:34px 34px,34px 34px;mask-image:linear-gradient(to bottom, #000, rgba(0,0,0,.35) 45%, transparent 80%);-webkit-mask-image:linear-gradient(to bottom, #000, rgba(0,0,0,.35) 45%, transparent 80%);animation:noc-grid-run 2.4s linear infinite"></div>
        </div>
        <div style="position:absolute;left:0;right:0;top:62%;height:1px;background:linear-gradient(to right, transparent, var(--color-accent-500) 18%, var(--color-accent-300) 50%, var(--color-accent-500) 82%, transparent)"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 56% 32% at 50% 40%, rgba(22,24,38,0.8), transparent 72%)"></div>
      </div>
    </sc-if>

    <sc-if value="{{ bgEmber }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 40% at 50% 104%, rgba(93,82,148,0.55), transparent 72%),radial-gradient(ellipse 58% 38% at 50% 38%, rgba(66,58,106,0.35), transparent 70%);animation:noc-breathe 12s ease-in-out infinite"></div>
        <div style="position:absolute;left:14%;bottom:-6px;width:3px;height:3px;border-radius:50%;background:var(--color-accent-300);box-shadow:0 0 8px rgba(145,132,217,.8);animation:noc-float-up 15s linear infinite"></div>
        <div style="position:absolute;left:27%;bottom:-6px;width:2px;height:2px;border-radius:50%;background:var(--color-accent-400);animation:noc-float-up-b 21s linear infinite 2s"></div>
        <div style="position:absolute;left:38%;bottom:-6px;width:4px;height:4px;border-radius:50%;background:var(--color-accent-400);filter:blur(.4px);box-shadow:0 0 10px rgba(145,132,217,.7);animation:noc-float-up 18s linear infinite 5s"></div>
        <div style="position:absolute;left:52%;bottom:-6px;width:2px;height:2px;border-radius:50%;background:var(--color-accent-200);animation:noc-float-up-b 26s linear infinite 8s"></div>
        <div style="position:absolute;left:63%;bottom:-6px;width:3px;height:3px;border-radius:50%;background:var(--color-accent-500);box-shadow:0 0 9px rgba(145,132,217,.6);animation:noc-float-up 17s linear infinite 3s"></div>
        <div style="position:absolute;left:74%;bottom:-6px;width:2px;height:2px;border-radius:50%;background:var(--color-accent-300);animation:noc-float-up-b 23s linear infinite 12s"></div>
        <div style="position:absolute;left:86%;bottom:-6px;width:3px;height:3px;border-radius:50%;background:var(--color-accent-400);filter:blur(.5px);animation:noc-float-up 20s linear infinite 6s"></div>
        <div style="position:absolute;left:94%;bottom:-6px;width:2px;height:2px;border-radius:50%;background:var(--color-accent-200);animation:noc-float-up-b 29s linear infinite 15s"></div>
      </div>
    </sc-if>

    <sc-if value="{{ bgRain }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, #1b1e2e, #161826 62%)"></div>
        <div style="position:absolute;inset:-10% -6%;transform:rotate(7deg)">
          <div style="position:absolute;left:4%;top:0;width:1.5px;height:64px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.42));animation:noc-drop 1.5s linear infinite"></div>
          <div style="position:absolute;left:11%;top:0;width:1px;height:46px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(178,182,202,0.34));animation:noc-drop 2.1s linear infinite .5s"></div>
          <div style="position:absolute;left:18%;top:0;width:1.5px;height:82px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.36));animation:noc-drop 1.2s linear infinite .9s"></div>
          <div style="position:absolute;left:26%;top:0;width:1px;height:54px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(145,132,217,0.4));animation:noc-drop 1.8s linear infinite .2s"></div>
          <div style="position:absolute;left:33%;top:0;width:1.5px;height:70px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(178,182,202,0.3));animation:noc-drop 1.35s linear infinite 1.1s"></div>
          <div style="position:absolute;left:41%;top:0;width:1px;height:40px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.3));animation:noc-drop 2.4s linear infinite .3s"></div>
          <div style="position:absolute;left:48%;top:0;width:1.5px;height:90px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.4));animation:noc-drop 1.15s linear infinite .7s"></div>
          <div style="position:absolute;left:56%;top:0;width:1px;height:58px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(178,182,202,0.32));animation:noc-drop 1.95s linear infinite 1.4s"></div>
          <div style="position:absolute;left:63%;top:0;width:1.5px;height:66px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(145,132,217,0.36));animation:noc-drop 1.55s linear infinite .1s"></div>
          <div style="position:absolute;left:71%;top:0;width:1px;height:48px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.28));animation:noc-drop 2.2s linear infinite .8s"></div>
          <div style="position:absolute;left:78%;top:0;width:1.5px;height:76px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(178,182,202,0.34));animation:noc-drop 1.3s linear infinite 1.6s"></div>
          <div style="position:absolute;left:86%;top:0;width:1px;height:52px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(207,211,229,0.32));animation:noc-drop 1.75s linear infinite .45s"></div>
          <div style="position:absolute;left:93%;top:0;width:1.5px;height:62px;border-radius:2px;background:linear-gradient(to bottom, transparent, rgba(145,132,217,0.34));animation:noc-drop 1.45s linear infinite 1.2s"></div>
        </div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 62% 38% at 50% 44%, rgba(22,24,38,0.78), transparent 74%)"></div>
      </div>
    </sc-if>

    <sc-if value="{{ bgRings }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 70% 46% at 50% 46%, #23263c, transparent 72%)"></div>
        <div style="position:absolute;left:50%;top:46%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;border:1px solid var(--color-accent-600);animation:noc-ripple 9s ease-out infinite"></div>
        <div style="position:absolute;left:50%;top:46%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;border:1px solid var(--color-accent-500);animation:noc-ripple 9s ease-out infinite 3s"></div>
        <div style="position:absolute;left:50%;top:46%;width:420px;height:420px;margin:-210px 0 0 -210px;border-radius:50%;border:1px solid var(--color-accent-700);animation:noc-ripple 9s ease-out infinite 6s"></div>
        <div style="position:absolute;left:50%;top:46%;width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:50%;filter:blur(40px);background:radial-gradient(circle at 50% 50%, rgba(145,132,217,0.30), transparent 70%);animation:noc-breathe 10s ease-in-out infinite"></div>
      </div>
    </sc-if>

    <div style="position:relative;height:100%;display:flex;flex-direction:column;padding:62px 20px 42px;box-sizing:border-box">

      <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0 var(--space-6)">
        <div style="display:flex;align-items:baseline;gap:var(--space-3)">
          <span style="font-family:var(--font-heading);font-weight:500;font-size:17px;letter-spacing:-0.015em">Nocturne</span>
          <span style="width:12px;height:1px;background:var(--color-accent);display:inline-block;transform:translateY(-5px)"></span>
          <span style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--color-neutral-500)">Focus</span>
        </div>
        <span ref="{{ clockRef }}" style="font-size:12px;color:var(--color-neutral-500);font-variant-numeric:tabular-nums">{{ clockText }}</span>
      </div>

      <div style="display:flex;gap:var(--space-1);padding:3px;border-radius:var(--radius-md);border:1px solid var(--color-neutral-800);background:rgba(35,37,50,0.55);backdrop-filter:blur(6px)">
        <button onClick="{{ pickFocus }}" style="position:relative;flex:1;appearance:none;background:transparent;border:0;cursor:pointer;color:var(--color-text);font-family:var(--font-heading);font-weight:500;font-size:13px;height:38px;border-radius:var(--radius-sm)" style-hover="background:rgba(145,132,217,0.10)">Focus
          <sc-if value="{{ isFocus }}" hint-placeholder-val="{{ true }}"><span style="position:absolute;left:50%;bottom:5px;transform:translateX(-50%);width:16px;height:1.5px;background:var(--color-accent)"></span></sc-if>
        </button>
        <button onClick="{{ pickShort }}" style="position:relative;flex:1;appearance:none;background:transparent;border:0;cursor:pointer;color:var(--color-neutral-400);font-family:var(--font-heading);font-weight:500;font-size:13px;height:38px;border-radius:var(--radius-sm)" style-hover="background:rgba(145,132,217,0.10);color:var(--color-text)">Short
          <sc-if value="{{ isShort }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;left:50%;bottom:5px;transform:translateX(-50%);width:16px;height:1.5px;background:var(--color-accent)"></span></sc-if>
        </button>
        <button onClick="{{ pickLong }}" style="position:relative;flex:1;appearance:none;background:transparent;border:0;cursor:pointer;color:var(--color-neutral-400);font-family:var(--font-heading);font-weight:500;font-size:13px;height:38px;border-radius:var(--radius-sm)" style-hover="background:rgba(145,132,217,0.10);color:var(--color-text)">Long
          <sc-if value="{{ isLong }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;left:50%;bottom:5px;transform:translateX(-50%);width:16px;height:1.5px;background:var(--color-accent)"></span></sc-if>
        </button>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-8);min-height:0">

        <div style="position:relative;width:294px;height:294px;display:flex;align-items:center;justify-content:center">
          <sc-if value="{{ haloFlash }}" hint-placeholder-val="{{ false }}">
            <div style="position:absolute;inset:-16%;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 50% 50%, rgba(145,132,217,0.34) 0%, transparent 62%);animation:noc-halo 0.45s ease-in-out 2"></div>
          </sc-if>
          <sc-if value="{{ haloPulse }}" hint-placeholder-val="{{ false }}">
            <div style="position:absolute;inset:-16%;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 50% 50%, rgba(145,132,217,0.30) 0%, transparent 62%);animation:noc-halo 4.5s ease-in-out infinite"></div>
          </sc-if>
          <sc-if value="{{ haloIdle }}" hint-placeholder-val="{{ true }}">
            <div style="position:absolute;inset:-16%;border-radius:50%;pointer-events:none;background:radial-gradient(circle at 50% 50%, rgba(145,132,217,0.14) 0%, transparent 62%)"></div>
          </sc-if>
          <svg viewBox="0 0 392 392" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)">
            <circle cx="196" cy="196" r="172" fill="none" stroke="#3f424d" stroke-width="2"></circle>
            <circle cx="196" cy="196" r="172" fill="none" stroke="var(--color-accent)" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1080.7" ref="{{ ringRef }}" stroke-dashoffset="{{ dashOffset }}" style="transition:stroke-dashoffset .35s linear"></circle>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-3)">
            <div style="display:flex;align-items:center;gap:var(--space-2);font-size:10.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--color-accent-300)">
              <sc-if value="{{ running }}" hint-placeholder-val="{{ false }}">
                <span style="width:5px;height:5px;border-radius:50%;background:var(--color-accent);display:inline-block;animation:noc-tick 1s steps(1,end) infinite"></span>
              </sc-if>
              <sc-if value="{{ paused }}" hint-placeholder-val="{{ true }}">
                <span style="width:5px;height:5px;border-radius:50%;background:var(--color-accent);display:inline-block;opacity:.3"></span>
              </sc-if>{{ phaseLabel }}
            </div>
            <div ref="{{ timeRef }}" style="font-family:var(--font-heading);font-weight:300;font-size:76px;line-height:1;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;color:var(--color-text)">{{ timeText }}</div>
            <div style="font-size:11.5px;color:var(--color-neutral-500);letter-spacing:0.03em">{{ subLabel }}</div>
          </div>
        </div>

        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <sc-for list="{{ dots }}" as="dot" hint-placeholder-count="4">
            <sc-if value="{{ dot.filled }}" hint-placeholder-val="{{ false }}">
              <span style="width:7px;height:7px;border-radius:50%;display:inline-block;background:var(--color-accent);box-shadow:0 0 10px rgba(145,132,217,.7)"></span>
            </sc-if>
            <sc-if value="{{ dot.empty }}" hint-placeholder-val="{{ true }}">
              <span style="width:7px;height:7px;border-radius:50%;display:inline-block;background:var(--color-neutral-800)"></span>
            </sc-if>
          </sc-for>
          <span style="margin-left:var(--space-2);font-size:10.5px;color:var(--color-neutral-600);letter-spacing:0.09em;text-transform:uppercase">{{ cycleLabel }} · {{ nextUpLabel }}</span>
        </div>

        <div style="display:flex;flex-direction:column;align-items:stretch;gap:var(--space-3);width:100%">
          <button onClick="{{ toggle }}" class="btn btn-primary" style="height:52px;font-size:16px;letter-spacing:0.02em;border-radius:var(--radius-md)">{{ toggleLabel }}</button>
          <div style="display:flex;gap:var(--space-3)">
            <button onClick="{{ reset }}" class="btn btn-ghost" style="flex:1;height:46px;color:var(--color-neutral-400);border:1px solid var(--color-neutral-800)">Reset</button>
            <button onClick="{{ skip }}" class="btn btn-ghost" style="flex:1;height:46px;color:var(--color-neutral-400);border:1px solid var(--color-neutral-800)">Skip →</button>
          </div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:var(--space-4);padding-top:var(--space-6);animation:noc-rise .5s ease-out both">
        <div style="display:flex;align-items:baseline;justify-content:space-between">
          <div style="display:flex;align-items:baseline;gap:var(--space-2)">
            <span style="font-family:var(--font-heading);font-weight:300;font-size:26px;line-height:1;font-variant-numeric:tabular-nums">{{ focusMinutesDone }}</span>
            <span style="font-size:11.5px;color:var(--color-neutral-500)">min focused today</span>
          </div>
          <span style="font-size:11.5px;color:var(--color-neutral-500)">{{ sessionsLabel }}</span>
        </div>
        <div style="display:flex;gap:var(--space-2);overflow-x:auto;padding-bottom:2px;scrollbar-width:none;mask-image:linear-gradient(to right, #000 92%, transparent);-webkit-mask-image:linear-gradient(to right, #000 92%, transparent)">
          <sc-for list="{{ backdrops }}" as="bd" hint-placeholder-count="6">
            <sc-if value="{{ bd.active }}" hint-placeholder-val="{{ true }}">
              <button onClick="{{ bd.on }}" style="flex:none;width:62px;display:flex;flex-direction:column;align-items:center;gap:6px;appearance:none;cursor:pointer;padding:var(--space-3) 0;border-radius:var(--radius-md);color:var(--color-text);border:1px solid var(--color-accent);background:rgba(145,132,217,0.12);min-height:56px">
                <span style="{{ bd.swatch }}"></span>
                <span style="font-size:10.5px;font-family:var(--font-heading);font-weight:500">{{ bd.label }}</span>
              </button>
            </sc-if>
            <sc-if value="{{ bd.inactive }}" hint-placeholder-val="{{ false }}">
              <button onClick="{{ bd.on }}" style="flex:none;width:62px;display:flex;flex-direction:column;align-items:center;gap:6px;appearance:none;cursor:pointer;padding:var(--space-3) 0;border-radius:var(--radius-md);color:var(--color-neutral-400);border:1px solid var(--color-neutral-800);background:transparent;min-height:56px" style-hover="background:rgba(145,132,217,0.08);color:var(--color-text)">
                <span style="{{ bd.swatch }}"></span>
                <span style="font-size:10.5px;font-family:var(--font-heading);font-weight:500">{{ bd.label }}</span>
              </button>
            </sc-if>
          </sc-for>
        </div>
      </div>
    </div>
  </div>

</x-import>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props="{&quot;$preview&quot;:{&quot;width&quot;:460,&quot;height&quot;:940},&quot;focusMinutes&quot;:{&quot;editor&quot;:&quot;range&quot;,&quot;default&quot;:25,&quot;min&quot;:5,&quot;max&quot;:60,&quot;step&quot;:1,&quot;unit&quot;:&quot;min&quot;,&quot;tsType&quot;:&quot;number&quot;,&quot;section&quot;:&quot;Timing&quot;},&quot;shortBreakMinutes&quot;:{&quot;editor&quot;:&quot;range&quot;,&quot;default&quot;:5,&quot;min&quot;:1,&quot;max&quot;:15,&quot;step&quot;:1,&quot;unit&quot;:&quot;min&quot;,&quot;tsType&quot;:&quot;number&quot;,&quot;section&quot;:&quot;Timing&quot;},&quot;longBreakMinutes&quot;:{&quot;editor&quot;:&quot;range&quot;,&quot;default&quot;:15,&quot;min&quot;:5,&quot;max&quot;:40,&quot;step&quot;:1,&quot;unit&quot;:&quot;min&quot;,&quot;tsType&quot;:&quot;number&quot;,&quot;section&quot;:&quot;Timing&quot;},&quot;autoContinue&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Behavior&quot;},&quot;glow&quot;:{&quot;editor&quot;:&quot;boolean&quot;,&quot;default&quot;:true,&quot;tsType&quot;:&quot;boolean&quot;,&quot;section&quot;:&quot;Behavior&quot;},&quot;backdrop&quot;:{&quot;editor&quot;:&quot;enum&quot;,&quot;options&quot;:[&quot;aurora&quot;,&quot;stars&quot;,&quot;grid&quot;,&quot;ember&quot;,&quot;rain&quot;,&quot;rings&quot;],&quot;default&quot;:&quot;aurora&quot;,&quot;tsType&quot;:&quot;string&quot;,&quot;section&quot;:&quot;Behavior&quot;},&quot;dailyGoal&quot;:{&quot;editor&quot;:&quot;int&quot;,&quot;default&quot;:8,&quot;min&quot;:1,&quot;max&quot;:16,&quot;tsType&quot;:&quot;number&quot;,&quot;section&quot;:&quot;Behavior&quot;}}">
const CIRC = 2 * Math.PI * 172;

const BACKDROPS = [
  { id: 'aurora', label: 'Aurora', swatch: 'linear-gradient(100deg, transparent 8%, #5d5294 34%, #4c5397 52%, #353b80 66%, transparent 92%), #1b1d2c' },
  { id: 'stars',  label: 'Stars', swatch: 'radial-gradient(1.4px 1.4px at 28% 30%,#f3f5fe,transparent), radial-gradient(1.2px 1.2px at 68% 24%,#d2cefd,transparent), radial-gradient(1.2px 1.2px at 46% 66%,#cfd3e5,transparent), radial-gradient(1px 1px at 80% 74%,#b2b6ca,transparent), radial-gradient(ellipse at 30% 60%, #2b2741, #1b1d2c 70%)' },
  { id: 'grid',   label: 'Horizon', swatch: 'linear-gradient(to bottom, #1b1d2c 46%, rgba(145,132,217,.75) 47%, #23263c 48%), linear-gradient(to right, rgba(145,132,217,.35) 1px, transparent 1px) 0 0/7px 7px' },
  { id: 'ember',  label: 'Embers', swatch: 'radial-gradient(1.6px 1.6px at 34% 40%,#d2cefd,transparent), radial-gradient(1.4px 1.4px at 66% 26%,#b5abfc,transparent), radial-gradient(ellipse 80% 50% at 50% 108%, #5d5294, #1b1d2c 74%)' },
  { id: 'rain',   label: 'Rain', swatch: 'repeating-linear-gradient(12deg, rgba(207,211,229,.45) 0 3px, transparent 3px 7px), linear-gradient(#1e2131,#1b1d2c)' },
  { id: 'rings',  label: 'Ripple', swatch: 'radial-gradient(circle at 50% 50%, transparent 0 22%, rgba(145,132,217,.55) 23% 25%, transparent 26% 44%, rgba(145,132,217,.3) 45% 47%, transparent 48%), #1b1d2c' }
];

class Component extends DCLogic {
  constructor(props) {
    super(props);
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem('noc-focus-v1') || '{}'); } catch (e) {}
    this.state = {
      mode: 'focus',
      endAt: null,          // ms timestamp when the current phase ends (null = paused)
      pausedLeft: (props.focusMinutes ?? 25) * 60 * 1000,
      completed: saved.completed ?? 0,
      focusSeconds: saved.focusSeconds ?? 0,
      log: Array.isArray(saved.log) ? saved.log : [],
      backdrop: saved.backdrop ?? (props.backdrop ?? 'aurora'),
      now: Date.now(),
      flash: false
    };
    this.paint = this.paint.bind(this);
    this.timeRef = React.createRef();
    this.ringRef = React.createRef();
    this.clockRef = React.createRef();
  }

  ensureClock() {
    if (this.clock) return;
    const step = () => {
      const now = Date.now();
      const { endAt, mode } = this.state;
      this.state.now = now;
      if (endAt !== null) {
        if (mode === 'focus') this.state.focusSeconds += 0.2;
        if (endAt - now <= 0) { this.complete(); return; }
      }
      this.paint();
    };
    /* Page timers are throttled to ~1/min while the tab or preview frame is
       hidden, which would stall the countdown; a worker's timer is not. */
    try {
      const src = 'setInterval(function(){postMessage(0)},200)';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      w.onmessage = step;
      this.clock = { stop: () => { w.terminate(); URL.revokeObjectURL(url); } };
    } catch (e) {
      const id = setInterval(step, 200);
      this.clock = { stop: () => clearInterval(id) };
    }
    document.addEventListener('visibilitychange', this.paint);
  }

  /* Paints the live values straight into the DOM — a 200ms render loop through
     React would be both wasteful and dependent on frame scheduling. */
  paint() {
    const s = this.state, total = this.durations()[s.mode];
    const running = s.endAt !== null;
    const leftMs = Math.max(0, running ? s.endAt - Date.now() : s.pausedLeft);
    const mins = Math.floor(leftMs / 60000), secs = Math.floor((leftMs % 60000) / 1000);
    const txt = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    if (this.timeRef.current && this.timeRef.current.textContent !== txt) {
      this.timeRef.current.textContent = txt;
    }
    if (this.ringRef.current) {
      const frac = total ? Math.min(1, Math.max(0, 1 - leftMs / total)) : 0;
      this.ringRef.current.setAttribute('stroke-dashoffset', String(CIRC * (1 - frac)));
    }
    if (this.clockRef.current) {
      const c = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      if (this.clockRef.current.textContent !== c) this.clockRef.current.textContent = c;
    }
  }

  durations() {
    return {
      focus: Math.round((this.props.focusMinutes ?? 25) * 60000),
      short: Math.round((this.props.shortBreakMinutes ?? 5) * 60000),
      long: Math.round((this.props.longBreakMinutes ?? 15) * 60000)
    };
  }

  componentDidMount() {
    this.ensureClock();
    this.onKey = (e) => {
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); this.toggle(); }
      else if (e.key === 'r' || e.key === 'R') this.reset();
      else if (e.key === 's' || e.key === 'S') this.skip();
    };
    window.addEventListener('keydown', this.onKey);
  }
  componentWillUnmount() {
    if (this.clock) this.clock.stop();
    this.clock = null;
    document.removeEventListener('visibilitychange', this.paint);
    if (this.onKey) window.removeEventListener('keydown', this.onKey);
  }

  persist(patch) {
    const s = { ...this.state, ...patch };
    try {
      localStorage.setItem('noc-focus-v1', JSON.stringify({
        completed: s.completed, focusSeconds: s.focusSeconds, log: s.log.slice(0, 12), backdrop: s.backdrop
      }));
    } catch (e) {}
  }

  complete() {
    const d = this.durations();
    const wasFocus = this.state.mode === 'focus';
    const at = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const entry = { label: wasFocus ? 'Focus · ' + Math.round(d.focus / 60000) + 'm' : 'Break', at };
    const completed = wasFocus ? this.state.completed + 1 : this.state.completed;
    const nextMode = wasFocus ? (completed % 4 === 0 ? 'long' : 'short') : 'focus';
    const auto = this.props.autoContinue ?? true;
    const patch = {
      mode: nextMode,
      endAt: auto ? Date.now() + d[nextMode] : null,
      pausedLeft: d[nextMode],
      completed,
      log: [entry, ...this.state.log].slice(0, 12),
      flash: true
    };
    this.persist(patch);
    this.setState(patch);
    setTimeout(() => this.setState({ flash: false }), 900);
  }

  toggle() {
    this.ensureClock();
    this.setState((s) => s.endAt !== null
      ? { endAt: null, pausedLeft: Math.max(0, s.endAt - Date.now()) }
      : { endAt: Date.now() + s.pausedLeft, now: Date.now() });
  }
  reset() { this.setState({ endAt: null, pausedLeft: this.durations()[this.state.mode] }); }
  skip() { this.complete(); }
  pick(mode) { this.setState({ mode, endAt: null, pausedLeft: this.durations()[mode] }); }
  setBackdrop(id) { this.persist({ backdrop: id }); this.setState({ backdrop: id }); }

  renderVals() {
    this.ensureClock();
    const s = this.state, d = this.durations();
    const total = d[s.mode];
    const running = s.endAt !== null;
    const leftMs = Math.max(0, running ? s.endAt - s.now : s.pausedLeft);
    const mins = Math.floor(leftMs / 60000), secs = Math.floor((leftMs % 60000) / 1000);
    const frac = total ? Math.min(1, Math.max(0, 1 - leftMs / total)) : 0;
    const pulse = (this.props.glow ?? true) && running;

    const dots = [0, 1, 2, 3].map((i) => {
      const filled = (s.completed % 4 === 0 && s.completed > 0 ? 4 : s.completed % 4) > i;
      return { filled, empty: !filled };
    });

    const backdrops = BACKDROPS.map((b) => {
      const active = s.backdrop === b.id;
      return {
        label: b.label, active, inactive: !active,
        on: () => this.setBackdrop(b.id),
        swatch: 'width:26px;height:26px;flex:none;border-radius:7px;background:' + b.swatch +
          ';box-shadow:inset 0 0 0 1px rgba(233,233,237,0.10)'
      };
    });

    const nextMode = s.mode === 'focus' ? ((s.completed + 1) % 4 === 0 ? 'Long break' : 'Short break') : 'Focus';

    return {
      timeText: String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0'),
      phaseLabel: s.mode === 'focus' ? 'Focus' : s.mode === 'short' ? 'Short break' : 'Long break',
      subLabel: s.mode === 'focus' ? 'of ' + Math.round(total / 60000) + ' minutes' : 'step away from the screen',
      dashOffset: CIRC * (1 - frac),
      toggleLabel: running ? 'Pause' : leftMs >= total ? 'Start focus' : 'Resume',
      toggle: () => this.toggle(),
      reset: () => this.reset(),
      skip: () => this.skip(),
      pickFocus: () => this.pick('focus'),
      pickShort: () => this.pick('short'),
      pickLong: () => this.pick('long'),
      isFocus: s.mode === 'focus', isShort: s.mode === 'short', isLong: s.mode === 'long',
      bgAurora: s.backdrop === 'aurora', bgStars: s.backdrop === 'stars',
      bgGrid: s.backdrop === 'grid', bgEmber: s.backdrop === 'ember',
      bgRain: s.backdrop === 'rain', bgRings: s.backdrop === 'rings',
      backdrops, dots,
      timeRef: this.timeRef, ringRef: this.ringRef, clockRef: this.clockRef,
      cycleLabel: 'Cycle ' + (Math.floor(s.completed / 4) + 1),
      haloFlash: s.flash,
      haloPulse: !s.flash && pulse,
      haloIdle: !s.flash && !pulse,
      running, paused: !running,
      clockText: new Date(s.now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      focusMinutesDone: Math.round(s.focusSeconds / 60),
      sessionsLabel: s.completed + ' / ' + (this.props.dailyGoal ?? 8) + ' sessions',
      log: s.log, hasLog: s.log.length > 0, noLog: s.log.length === 0,
      nextUpLabel: 'next ' + nextMode.toLowerCase()
    };
  }
}
</script>
</body>
</html>
