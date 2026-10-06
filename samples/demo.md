# 豆包 2\.1 Pro 升级后能看懂户型图尺寸了，我用一张平面图加一张大床，试出了能走进去的 3D 样板间

豆包 Seed\-2\.1\-pro 最近升级到了 0915 版本，这次升级的重点之一，是多模态视觉理解能力的提升，尤其是对图纸、尺寸标注、空间关系这类信息密度极高的图，识别和理解的准确度有明显提升。

说白了，以前大模型看图，大多只能看懂图里画了什么，现在开始能看懂尺寸和空间关系了。不少需要立体、空间、建模、交互的问题，现在可以直接甩给它办了。

装修就是这么一个典型场景。户型图上全是密密麻麻的尺寸标注和专业符号，普通人看图都费劲，更别说照着建模了。我决定拿这个场景，试试这次升级到底能落地到什么程度。

先上最终效果。

\[20260917151241\_rec\_\-convert\.mp4\]

拖着视角在那个房间里转来转去，有种提前看见家的感觉。

## 只要一张户型图，就能做出这样的 3D 样板间

大家在租房、买房，或者装修房子的时候，大概都刷到过让人心动的小户型，脑子里全是碎片。床摆哪儿，柜子打多宽，人还能不能顺顺当当走到窗边，往往一概没底。

而大家真正想搞清楚的一件事，其实是等真要装修了，能不能在动工、买家具之前，先走进那个空间看个明白。刚好豆包这次升级的能力方向踩在了这个点上，我决定拿它试试水。

为了把难度拉满，我专门挑了卧室里最难摆的大件，一张快 2\.2 米的大床。这种尺寸放进小户型最吃摆法，放错了连走路都费劲，我把实景图、产品图、规格表一起丢给了它。下面把过程复盘一遍，原话都贴出来，你们也能照着试。



## 门槛低到什么程度，不用装任何软件

新建一个任务，模型选豆包 2\.1 Pro，把图片拖进去，大白话提要求就行。它干活的过程会一条条摊开给我看，到了要我拿主意的地方会主动停下来等确认。网页、代码这些全是它在底层自己搞定，我拿到手的就是一个能双击打开的网页文件。

## 第一步，一张户型图，让它先把房子盖出来

很多人可能也说不清一个 3D 项目该分几步、用什么做，我索性把模糊的需求整个丢过去。

> 帮我用 html 1:1 制作该户型的 3D 可互动页面。
> 
> 

它没急着动手画，先读图。总尺寸 9197×4845 毫米，三个房间各自的面积，墙多厚，入户门往哪开，东墙是一整面落地推拉门，指北针朝哪，它逐个读了出来。为了做到真正的 1 比 1，它把每一处标注都放大看，按像素标定墙体坐标，再用总尺寸反推回毫米。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MjczYjk1NTg3YWNlNjY0YWRiNWMwMzBmM2QxYTYxNTBfZTM1ZmMxNmUxZDQyNzJhODg2NjU5NjM1OTE4MmM1MDlfSUQ6NzY4NjM5OTEzNjU3MzEzMjA2OF8xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

然后，直接给了我一个能互动的 3D 毛坯房。

\[20260917093004\_rec\_\.mp4\]



俯视能把屋顶剖掉看格局，人视是真人站着的高度，点一下门它真的会打开，点房间会弹出面积。我自己转着玩了好半天。当然不是一次就完美，墙面过曝、玻璃几乎看不见、手机上控制面板挤在一起，这几个问题它都是自己截图回读，一版版调过来的。



## 第二步，把最难摆的大床丢给它，三张照片读尺寸

毛坯有了，真正难的是布置。我把那一张大床的三张图发过去，一张卧室实景，一张白底产品图，一张规格表，让它摆进大床房，顺便看看还能塞下哪些家具。

> 我需要在大床房布置这个床，帮我先确认当前空间是否能够容纳。
> 
> 而且剩余的空间我可以继续布置哪些家具？这个阶段你可以先出一版平面图给我。
> 
> 需要等我确认后，才可以制作到 3D 可互动的页面里。
> 
> 

它先从图里把床的底细抠了出来，外径 210×218 厘米，床头高 98 厘米，橡胶木框架，聚酯软包。接着拿房间的净尺寸开始算，注意是净尺寸不是含墙面积，核心睡眠净区约 5272×3930 毫米，20\.7㎡，床本身占地约 4\.6㎡。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=MWZhNDMzOGFmNDQ0NDk4OTMwMjQ0NmQ4ODg1MWQ5NDVfZjA5MDZhZTBhMjQzMzZmYzRjNzA3ZjdiYTEyOGNlODZfSUQ6NzY4NjM5OTM5MTY3NDMyMjE0Nl8xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

## 第三步，它自己拦住了我，先扔一张平面图等我拍板

我特意叮嘱，先出平面图，等我确认再做 3D。说实话没抱太大期望，结果它真的就停在了 2D，一步没多走。

给我的是一张毫米等比的平面图。床头靠南墙整面实墙，床尾正对电视柜，东向落地窗留在床侧。每条过道的净宽都标了出来，床尾主通道 1430 毫米，最窄处也有 1230 毫米，床两侧到墙、到落地窗在 1039 到 1553 毫米之间，三边动线全在 1 米以上。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NWRjNzdkYjgzNTVmNzY2NjRkOWZiMTNhN2ViZjNiY2ZfZjNlMjNiM2IwOTg3NWViODgxZWY5Y2JmNjY5M2EyODNfSUQ6NzY4NjM5OTY4NzUxNTczNzI4NF8xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

图下面还压着一张校核表，结论就四个字，可以容纳，且空间宽裕。床之外还剩约 16㎡，通顶衣柜、电视柜加壁挂电视、梳妆台、窗边休闲椅、绿植、床尾凳，该放哪都给了建议。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=OTdlOWVkM2IyNTk0M2E2YzkyZWYwYzdjNjQ1ZjkxNWJfODI3ZjFiZWNjM2M3NGVjNTE5ZTdkNGJhZTRhM2JjNTRfSUQ6NzY4NjM5OTcxNDIzNzE4OTMxM18xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

最妙的是，它还主动给了一个本版不推荐的朝向，床头要是改靠北墙会逼进入户开口，还得少放一个床头柜。

利弊摆出来，让我自己选，而不是只报喜。

这一步我好感直接拉满，它没急着甩给我一个炫酷的 3D，而是先把放不放得下、路留多宽这种我真正要拍板的事算清楚，摆到我面前，决定权一直在我手里。

## 第四步，我一点头，家具全进场，它还自己抓了个 bug

我回了三句确认，床头靠南墙，可选家具全配上，床尺寸维持不变，它这才动手。

> 已确认以下三点，开始制作 3D 页面。
> 
> 1、确认采用床头靠南墙摆位。
> 
> 2、可选家具全部都布置上。
> 
> 3、床的最终尺寸与当前设计一致。
> 
> 

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzVkYzU2M2QyZmE4ODIxMjY5OTMzZjM1ZDYxNzBkNzNfY2ViMTc3YjllYWU0NGU1NWYzZTY3ODk0OWQyNTgxOWRfSUQ6NzY4NjQxMTE4MTM1MzM3Mjg3MV8xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

然后它就开始把家具布置一件件按那张平面图，按 1 比 1 建了进去。



但制作过程也出现了一个问题，南墙是一面 2\.8 米高的整面实墙，床头贴着南墙，它最初选的观察角度正好撞上了这堵墙，床被挡了个严实，左下角的信息卡还跟房间列表挤在了一起。

![Image](https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=NzQ3ZWRiZTgzOGYxYzQ4MzU0ZTJjOGU4OWNkMGJmYzBfMjNmYTE4ZjlmODYxMjViYTVmYTY2Mzg1YjNhOWE0ZjdfSUQ6NzY4NjQxMTc3MzQ2OTcyMzkxOF8xNzkwOTYwNjUyOjE3OTEwNDcwNTJfVjM)

我没教它怎么改，就让它自己再看一眼，它通过截图回看，认出墙挡住床、面板重叠这两个问题，把观察机位挪到了北偏东，重新排了面板，再截图验证，第二版里床清清楚楚成了画面主角。

这个过程比一次做对还让我放心，它会自己先验收，发现问题自己改，改完再给我，而不是拿个半成品跟我说做好了。

\[20260917\-101323\.mp4\]

这是完整版录屏，看完前面的过程再回头看一遍，感受会不太一样。

## 写在最后

以前想看懂图纸、把它变成能走进去的空间，是设计师电脑里的专业壁垒，这次靠发几张图、说几句大白话，这道门槛被实实在在地绕过去了。

当然，它还替代不了人。图纸里没标清楚的地方，它是按行业常规默认补全的，最后怎么落地，还得靠现场实测和家具说明书核对。它更像一个手脚很快、还会自己检查一遍的施工队，图纸和方向始终得我来定。

以后大件家具下单之前，先在里面摆一遍，放不放得下、挡不挡路，一眼就清楚，能少踩很多买回来才发现摆不下的坑。

说到底，这次能做成，靠的是豆包 Seed\-2\.1\-pro 这次 0915 升级里，多模态视觉理解能力的提升，尤其是对工程图纸、尺寸标注这类信息密度极高的图，识别和理解的准确度提升了不止一点。这类升级最实在的价值，不是让会用工具的人更强，而是让不会用工具的人也能够上手。

