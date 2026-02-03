#!/bin/bash
# Monitor OpenCode memory usage
# Usage: ./monitor-opencode.sh

echo "Monitoring OpenCode memory usage (Ctrl+C to stop)"
echo "=================================================="
echo ""

while true; do
  clear
  echo "=== OpenCode Memory Usage - $(date '+%H:%M:%S') ==="
  echo ""

  # Find OpenCode processes
  opencode_procs=$(ps aux | grep -E 'opencode|claude-code' | grep -v grep | grep -v monitor-opencode)

  if [ -z "$opencode_procs" ]; then
    echo "❌ No OpenCode process found"
  else
    echo "$opencode_procs" | awk '{
      printf "PID: %-8s | CPU: %5s%% | MEM: %5s%% | RSS: %6sMB | CMD: %s\n",
      $2, $3, $4, int($6/1024), substr($0, index($0,$11))
    }'
    echo ""

    # Calculate total memory
    total_mem=$(echo "$opencode_procs" | awk '{sum+=$6} END {printf "%.0f", sum/1024}')
    echo "📊 Total OpenCode Memory: ${total_mem}MB"

    # Warning if memory is high (>15%)
    max_mem=$(echo "$opencode_procs" | awk '{if ($4>max) max=$4} END {print max}')
    if (( $(echo "$max_mem > 15.0" | bc -l) )); then
      echo "⚠️  WARNING: Memory usage above 15% - consider restarting OpenCode"
    fi
  fi

  sleep 3
done
