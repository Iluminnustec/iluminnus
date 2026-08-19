$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
# NAO usar /MIR: se o destino tambem guardar arquivos pessoais sem relacao com o
# projeto, /MIR pode apagar algo que so existia la (ja aconteceu com a Brivox em
# 2026-08-18). /E copia tudo da origem e sobrescreve o que mudou, mas NUNCA apaga
# nada do destino.
robocopy "C:\Users\Bruno\dev\sistema-base" "H:\Meu Drive\Iluminnus\Telas\sistema-base" /E `
  /XD node_modules .next .git .windsurf .claude generated Imagens Proposta imagens proposta db-backups `
  /XF dev.db "dev.db-journal" ".env" ".env.sqlite.bak" `
  /NFL /NDL /NJH
Write-Output "Sync done (exit code $LASTEXITCODE - 0-7 is normal for robocopy, no errors)."
