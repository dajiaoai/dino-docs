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
  knowledgePoints: string[];
  generation: GenerationRecord;
};

export type QuestionBatch = {
  id: string;
  name: string;
  questions: GeometryQuestion[];
};

export const batches: QuestionBatch[] = [
  {
    id: 'grade-8-autumn-geometry',
    name: '八年级上 · 几何综合练习',
    questions: [
      {
        id: 'q-001',
        code: 'GEO-0801',
        questionText:
          '如图，$AB$ 与 $CD$ 相交于点 $O$，$AO=CO$，$BO=DO$。求证：$\\triangle AOB \\cong \\triangle COD$。',
        knowledgePoints: ['全等三角形', 'SAS 判定', '对顶角'],
        generation: {
          questionId: 'q-001',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
      {
        id: 'q-002',
        code: 'GEO-0802',
        questionText:
          '直线 $a \\parallel b$，直线 $c$ 分别与 $a$、$b$ 相交。若 $\\angle 1=65^\\circ$，求 $\\angle 2$ 的度数。',
        knowledgePoints: ['平行线', '内错角', '角度计算'],
        generation: {
          questionId: 'q-002',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
      {
        id: 'q-003',
        code: 'GEO-0803',
        questionText:
          '在 $\\mathrm{Rt}\\triangle ABC$ 中，$\\angle C=90^\\circ$，$AC=6$，$BC=8$，求斜边 $AB$ 的长。',
        knowledgePoints: ['勾股定理', '直角三角形'],
        generation: {
          questionId: 'q-003',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
      {
        id: 'q-004',
        code: 'GEO-0804',
        questionText:
          '在 $\\triangle ABC$ 中，$AB=AC$，$AD$ 是 $BC$ 边上的中线。证明：$AD \\perp BC$。',
        knowledgePoints: ['等腰三角形', '中线', '垂直'],
        generation: {
          questionId: 'q-004',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
      {
        id: 'q-005',
        code: 'GEO-0805',
        questionText:
          '四边形 $ABCD$ 中，$AB \\parallel CD$ 且 $AB=CD$。求证：四边形 $ABCD$ 是平行四边形。',
        knowledgePoints: ['平行四边形', '全等三角形', '判定定理'],
        generation: {
          questionId: 'q-005',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
      {
        id: 'q-006',
        code: 'GEO-0806',
        questionText:
          '直线 $y=-x+4$ 分别交 $x$ 轴、$y$ 轴于 $A$、$B$ 两点，求 $\\triangle AOB$ 的面积。',
        knowledgePoints: ['一次函数', '坐标几何', '三角形面积'],
        generation: {
          questionId: 'q-006',
          status: 'pending',
          staticImageUrl: '',
          projectJson: undefined,
        },
      },
    ],
  },
];
