import type { VideoScriptOutput } from "@/lib/ai/schemas";

export function VideoScriptCard({ script }: { script: VideoScriptOutput }) {
  return (
    <div className="space-y-3">
      <p className="text-sm">
        <span className="font-medium">Accroche : </span>
        {script.hook}
      </p>
      <ol className="space-y-2">
        {script.scenes.map((scene, index) => (
          <li key={index} className="rounded-md border bg-gray-50 p-3 text-sm">
            <p className="font-medium text-gray-700">{scene.time}s</p>
            <p>
              <span className="text-gray-500">Visuel : </span>
              {scene.visual}
            </p>
            <p>
              <span className="text-gray-500">Voix off : </span>
              {scene.voiceover}
            </p>
            {scene.textOverlay && (
              <p>
                <span className="text-gray-500">Texte à l&apos;écran : </span>
                {scene.textOverlay}
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className="text-sm">
        <span className="font-medium">CTA : </span>
        {script.cta}
      </p>
    </div>
  );
}
