import type { FileContentLatest } from '@dajiaoai/algeo-sdk';

export type GenerationStatus =
  | 'pending'
  | 'submitting'
  | 'created'
  | 'running'
  | 'rendering'
  | 'finished'
  | 'error';

export type GenerationRecord = {
  questionId: string;
  status: GenerationStatus;
  taskId?: string;
  artifactUrl?: string;
  errorMessage?: string;
  staticImageUrl?: string;
  projectJson?: FileContentLatest;
};

export type GeometryQuestion = {
  id: string;
  code: string;
  questionText: string;
  imageUrl?: string;
  /** Local assets used by the built-in demonstration batch. */
  exampleResultImageUrl?: string;
  exampleProjectUrl?: string;
  knowledgePoints: string[];
  generation: GenerationRecord;
};

export type QuestionBatch = {
  id: string;
  name: string;
  questions: GeometryQuestion[];
};

// BASE_URL is `/demos/question-bank/` in production and `/` in local Vite.
// Do not use an absolute `/question-bank/...` path here: it bypasses the demo
// deployment prefix and is then served the SPA's index.html instead of JSON.
const assetRoot = `${import.meta.env.BASE_URL}question-bank/2026-zhongkao`;
const sourceImageUrls: Record<string, string> = {
  '001': 'https://img.jyeoo.net/quiz/images/svg/202607/55/b471308c.png',
  '002': 'https://img.jyeoo.net/quiz/images/svg/202607/19/1f1b514a.png',
  '003': 'https://img.jyeoo.net/quiz/images/svg/202606/1016/76b27ad3.png',
  '004': 'https://img.jyeoo.net/quiz/images/svg/202606/917/a6e38528.png',
  '005': 'https://img.jyeoo.net/quiz/images/svg/202606/900/d3e896e3.png',
  '006': 'https://img.jyeoo.net/quiz/images/svg/202606/858/219c8ff7.png',
  '007': 'https://img.jyeoo.net/quiz/images/svg/202606/825/f009e480.png',
  '008': 'https://img.jyeoo.net/quiz/images/svg/202606/849/8cdb7a1d.png',
  '009': 'https://img.jyeoo.net/quiz/images/svg/202606/727/abac1256.png',
  '010': 'https://img.jyeoo.net/quiz/images/svg/202606/749/6c06716c.png',
};

function exampleQuestion(
  number: string,
  questionText: string,
  knowledgePoints: string[],
): GeometryQuestion {
  const id = `zhongkao-2026-${number}`;
  return {
    id,
    code: number,
    questionText,
    // Keep the source diagram from the supplied CSV. The local result image and
    // project file are loaded after the demo generation finishes.
    imageUrl: sourceImageUrls[number],
    exampleResultImageUrl: `${assetRoot}/images/${number}.png`,
    exampleProjectUrl: `${assetRoot}/projects/${number}.json`,
    knowledgePoints,
    generation: { questionId: id, status: 'pending' },
  };
}

export const batches: QuestionBatch[] = [
  {
    id: 'zhongkao-2026-classic',
    name: '经典中考真题',
    questions: [
      exampleQuestion('001', '（2026·广东）如图，在 $\\mathrm{Rt}\\triangle ABC$ 中，$\\angle BAC=90^\\circ$，$AC=2\\sqrt{5}$，点 $D$ 在 $AB$ 上，且 $BD=3AD$，连接 $CD$．过点 $A$ 作 $CD$ 的垂线交 $CD$ 于点 $E$，交 $BC$ 于点 $F$，连接 $BE$，$AE=2$．\n\n（1）求 $CE$ 的长；\n\n（2）求证：$BD^2=9DE\\cdot DC$；\n\n（3）求 $\\dfrac{S_{\\triangle BEF}}{S_{\\triangle BDE}}$ 的值．', ['相似三角形的判定与性质', '勾股定理']),
      exampleQuestion('002', '（2026·中山）如图，抛物线 $y=ax^2+bx+2\\ (a\\neq0)$ 与 $x$ 轴交于 $A(-2,0)$、$B(1,0)$ 两点。\n\n（1）求抛物线的表达式；\n\n（2）点 $D$ 为抛物线在第二象限内的动点，求 $\\triangle ACD$ 面积的最大值；\n\n（3）在第二象限内的抛物线上是否存在点 $Q$，使得 $\\angle ACQ=2\\angle OCB$？若存在，求点 $Q$ 的坐标；若不存在，说明理由。', ['二次函数', '压轴题']),
      exampleQuestion('003', '（2026·湖北）如图，在 $\\triangle ABC$ 中，$AC=BC$，以 $BC$ 为直径的 $\\odot O$ 交 $AB$ 于点 $D$，弦 $DF\\perp BC$，垂足为 $E$。\n\n（1）求证：$AD=BD$；\n\n（2）若 $AB=10$，$DF=8$，求 $\\odot O$ 的半径。', ['圆周角定理', '等腰三角形的性质', '勾股定理', '垂径定理']),
      exampleQuestion('004', '（2026·南京）已知：$\\mathrm{Rt}\\triangle ABC$ 中，$\\angle C=90^\\circ$，$F$、$G$ 为 $AC$、$BC$ 边上的点，且 $DF\\perp AB$，$EG\\perp AB$。\n\n（1）求证：$\\triangle ADF\\sim\\triangle GEB$；\n\n（2）$\\angle B=30^\\circ$，$AB=6$，$DE=2$，$\\triangle ADF\\sim\\triangle GCF$，求 $AD$ 的长。', ['相似三角形的判定', '含30度角的直角三角形']),
      exampleQuestion('005', '（2026·河北）如图，二次函数 $y=(x-t)(x-3t)$（其中 $t>0$）的图象与 $x$ 轴交于 $A$、$B$ 两点（点 $A$ 在点 $B$ 左侧），与 $y$ 轴交于点 $C$，顶点为 $P$。将点 $B$ 绕点 $A$ 顺时针旋转 $90^\\circ$ 得到点 $D$。\n\n（1）若 $t=1$，求直线 $PD$ 的函数表达式，并判断点 $C^\\prime$（关于二次函数图象对称轴的对称点）是否在直线 $PD$ 上。\n\n（2）当 $3<x<6$ 时，二次函数的最大值为 $9$，求 $t$ 的值。\n\n（3）连接 $OP$，当点 $D$ 不在直线 $OP$ 上时，过点 $D$ 作直线 $DE\\parallel OP$ 交 $y$ 轴于点 $E(0,m)$，请直接写出 $m$ 的最小值。', ['二次函数']),
      exampleQuestion('006', '（2026·河南）在菱形 $ABCD$ 中，$\\angle BAD=120^\\circ$，$AB=4$。将边 $AB$ 绕点 $A$ 逆时针旋转至 $AE$，记旋转角为 $\\alpha$。作射线 $DE$，在线段 $DE$ 上取一点 $H$，使 $BH=BE$，连接 $CH$。\n\n（1）观察猜想\n\n当 $\\alpha=30^\\circ$ 时，如图1，$\\angle BEH$ 的度数为 $\\underline{\\hspace{1cm}}$，$CH$ 的长为 $\\underline{\\hspace{1cm}}$。\n\n（2）探究证明\n\n当 $0^\\circ<\\alpha<120^\\circ$ 时，（1）中的两个结论是否仍然成立？若成立，请仅就图2的情形进行证明；若不成立，请说明理由。\n\n（3）拓展延伸\n\n当 $0^\\circ<\\alpha<120^\\circ$ 时，若 $\\triangle DCH$ 的面积为 $4\\sqrt{2}$，请直接写出此时旋转角 $\\alpha$ 的度数。', ['勾股定理', '平行四边形的判定与性质', '菱形的判定与性质']),
      exampleQuestion('007', '（2026·河南）如图，在 $\\triangle ABC$ 中，$AB=AC=5$，$BC=6$，$CD$ 是角平分线。点 $E$ 为边 $BC$ 上一点，连接 $AE$，交 $CD$ 于点 $F$，连接 $BF$。若 $AE=2\\sqrt{5}$，则 $BF$ 的长为______。', ['勾股定理', '等腰三角形的性质']),
      exampleQuestion('008', '（2026·上海）在半圆 $AOQH$ 中，点 $O$ 为圆心，线段 $AQ$ 为直径，$B$、$C$ 是半圆上的两点，$D$ 是 $AB$ 上一点，连接 $AB$、$CD$ 交于点 $P$，且 $AB=CD$。\n\n（1）连接 $OP$。\n\n① 如图1，求证：$\\angle APO=\\angle CPO$；\n\n② 如图2，连接 $OB$ 交 $CD$ 于点 $H$，若 $AQ=4$，$PB=1$，$PO=HO$，求 $PH$ 的长。\n\n（2）如图3，连接 $AC$，$PQ$ 交于点 $E$，线段 $AP$ 上有一点 $F$，使得 $PF=4AF$，若 $PE=QE$，$\\angle PEA=\\angle PFQ$，求 $\\dfrac{PE}{EA}$。', ['圆的综合题']),
      exampleQuestion('009', '（2026·扬州）如图1，在边长为1的正方形 $ABCD$ 中，$E$ 是 $AD$ 边上的动点（不与点 $A$、$D$ 重合）。将 $\\triangle ABE$ 沿 $BE$ 翻折，得到 $\\triangle FBE$。过点 $F$ 作 $FM\\perp BE$，$FN\\perp BC$，垂足分别为 $M$、$N$。\n\n（1）如图2，若 $FM=FN$，求 $FM+FN$ 的值；\n\n（2）如图3，若 $E$ 为 $AD$ 中点，则 $FM$ 的长为______，$FN$ 的长为______；\n\n（3）求点 $E$ 运动过程中 $FM+FN$ 的最大值。', ['四边形综合题', '三角形的面积', '菱形的判定与性质', '菱形与面积']),
      exampleQuestion('010', '（2026·苏州）如图，关于 $x$ 的二次函数 $y=x^2-2mx+m^2+1$ 的图象为抛物线 $C$，直线 $y=a$ 与抛物线 $C$ 交于 $A$、$B$ 两点，过抛物线 $C$ 的顶点作 $x$ 轴的平行线，过 $A$、$B$ 分别作它的垂线，垂足为 $M$、$N$。若四边形 $ABNM$ 为正方形，则 $a=$______。', ['二次函数']),
    ],
  },
];
