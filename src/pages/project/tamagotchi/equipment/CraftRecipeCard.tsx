import { Button, Tag } from 'antd'
import {
  craftMaterialLabel,
  craftMaterialSource,
  gradeColor,
  gradeLabel,
  missingMaterials,
  slotLabel,
} from '../core/tamagotchi-helper'
import { ICraftRecipeView } from '../core/tamagotchi-interface'

interface ICraftRecipeCardProps {
  recipe: ICraftRecipeView
  // Another job is already in the queue, or a request is in flight.
  disabled: boolean
  onStart: (recipe: ICraftRecipeView) => void
}

const materialName = (itemId: string) => craftMaterialLabel[itemId] ?? itemId

export const CraftRecipeCard = (props: ICraftRecipeCardProps) => {
  const { recipe, disabled, onStart } = props
  const missing = missingMaterials(recipe.materials)
  const lacksCoin = recipe.canStart === false && missing.length === 0

  return (
    <div className="flex flex-col gap-1 rounded border border-slate-200 p-2 dark:border-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">{slotLabel[recipe.slot]}</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">{recipe.name}</span>
        <Tag color={gradeColor[recipe.baseGrade]}>{gradeLabel[recipe.baseGrade]}</Tag>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          สูงสุด <Tag color={gradeColor[recipe.maxGrade]}>{gradeLabel[recipe.maxGrade]}</Tag>
        </span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {recipe.materials.map((material) => {
          const enough = material.owned >= material.qty
          return (
            <span key={material.itemId} className={enough ? 'text-emerald-600' : 'text-rose-500'}>
              {materialName(material.itemId)} {material.owned}/{material.qty}
            </span>
          )
        })}
      </div>
      {missing.length > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          ขาด:{' '}
          {missing
            .map(
              ({ itemId, missing: count }) =>
                `${materialName(itemId)} ×${count} (${craftMaterialSource[itemId] ?? 'ดรอป'})`
            )
            .join(' · ')}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>
          🪙 {recipe.coin} · ⏱️{' '}
          {recipe.minutes >= 60 ? `${recipe.minutes / 60} ชม.` : `${recipe.minutes} นาที`}
        </span>
        {lacksCoin && <span className="text-rose-500">เหรียญไม่พอหรือมีงานค้างในคิว</span>}
        <Button
          size="small"
          type="primary"
          className="ml-auto"
          disabled={!recipe.canStart || disabled}
          onClick={() => onStart(recipe)}
        >
          เริ่มคราฟต์
        </Button>
      </div>
    </div>
  )
}
