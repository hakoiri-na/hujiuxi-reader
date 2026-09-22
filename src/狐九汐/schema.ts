export const Schema = z.object({
  世界: z
    .object({
      日期: z.string().prefault('待初始化'),
      曜日: z.enum(['月', '火', '水', '木', '金', '土', '日']).or(z.literal('待初始化')).prefault('待初始化'),
      时间: z.string().prefault('待初始化'),
    })
    .prefault({}),
  狐九汐: z
    .object({
      缘结值: z.coerce.number().transform(v => _.clamp(v, 0, 1314)).prefault(0),
      心情: z.string().prefault('待初始化'),
      心声: z.string().prefault('待初始化'),
      小钱袋: z.coerce.number().prefault(32000),
      购物日志: z.array(z.string()).transform(arr => _.takeRight(arr, 6)).prefault([]),
      着装: z.string().prefault('待初始化'),
    })
    .prefault({}),
  御神签: z
    .record(
      z.string(),
      z
        .object({
          番号: z.string().prefault(''),
          运势: z.string().prefault(''),
          寄语: z.string().prefault(''),
          解签: z.string().prefault(''),
          个别运势: z
            .object({ 愿望: z.string().prefault(''), 待人: z.string().prefault(''), 恋爱: z.string().prefault(''), 健康: z.string().prefault('') })
            .prefault({}),
        })
        .prefault({}),
    )
    .prefault({}),
});

export type CharacterData = z.infer<typeof Schema>;
