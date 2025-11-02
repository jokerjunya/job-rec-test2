#!/bin/bash

# Git Worktree ヘルパースクリプト
# 使用方法: ./scripts/worktree-helper.sh <command> [options]

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# プロジェクトルートの取得
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_BASE_DIR="${PROJECT_ROOT}/.worktrees"

# ヘルプ表示
show_help() {
    echo -e "${BLUE}Git Worktree ヘルパースクリプト${NC}"
    echo ""
    echo "使用方法: $0 <command> [options]"
    echo ""
    echo "コマンド:"
    echo "  list              - 現在のワークツリー一覧を表示"
    echo "  create <branch>   - 新しいブランチを作成してワークツリーを追加"
    echo "  add <branch>      - 既存のブランチのワークツリーを追加"
    echo "  remove <branch>   - 指定したブランチのワークツリーを削除"
    echo "  clean             - 不要なワークツリーを一括削除（確認あり）"
    echo "  status            - 各ワークツリーの状態を表示"
    echo ""
    echo "例:"
    echo "  $0 create feature-xyz main"
    echo "  $0 add hotfix/critical-bug"
    echo "  $0 remove feature-xyz"
    echo "  $0 list"
}

# ワークツリー一覧表示
list_worktrees() {
    echo -e "${BLUE}現在のワークツリー一覧:${NC}"
    echo ""
    cd "$PROJECT_ROOT"
    git worktree list
}

# 新しいワークツリーの作成
create_worktree() {
    local branch_name=$1
    local base_branch=${2:-main}
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}エラー: ブランチ名を指定してください${NC}"
        exit 1
    fi
    
    local worktree_path="${WORKTREE_BASE_DIR}/${branch_name}"
    
    echo -e "${YELLOW}新しいブランチ '${branch_name}' を作成してワークツリーを追加します...${NC}"
    echo -e "  ベースブランチ: ${base_branch}"
    echo -e "  ワークツリーパス: ${worktree_path}"
    echo ""
    
    cd "$PROJECT_ROOT"
    git worktree add -b "$branch_name" "$worktree_path" "$base_branch"
    
    echo -e "${GREEN}✓ ワークツリーが作成されました: ${worktree_path}${NC}"
}

# 既存ブランチのワークツリー追加
add_worktree() {
    local branch_name=$1
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}エラー: ブランチ名を指定してください${NC}"
        exit 1
    fi
    
    local worktree_path="${WORKTREE_BASE_DIR}/${branch_name}"
    
    echo -e "${YELLOW}既存のブランチ '${branch_name}' のワークツリーを追加します...${NC}"
    echo -e "  ワークツリーパス: ${worktree_path}"
    echo ""
    
    cd "$PROJECT_ROOT"
    git worktree add "$worktree_path" "$branch_name"
    
    echo -e "${GREEN}✓ ワークツリーが追加されました: ${worktree_path}${NC}"
}

# ワークツリーの削除
remove_worktree() {
    local branch_name=$1
    
    if [ -z "$branch_name" ]; then
        echo -e "${RED}エラー: ブランチ名を指定してください${NC}"
        exit 1
    fi
    
    local worktree_path="${WORKTREE_BASE_DIR}/${branch_name}"
    
    if [ ! -d "$worktree_path" ]; then
        echo -e "${RED}エラー: ワークツリーが見つかりません: ${worktree_path}${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}ワークツリーを削除します: ${worktree_path}${NC}"
    echo -e "${RED}警告: この操作は取り消せません${NC}"
    read -p "続行しますか? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        git worktree remove "$worktree_path"
        echo -e "${GREEN}✓ ワークツリーが削除されました: ${worktree_path}${NC}"
    else
        echo -e "${YELLOW}キャンセルされました${NC}"
    fi
}

# ワークツリーの状態表示
show_status() {
    echo -e "${BLUE}ワークツリーの状態:${NC}"
    echo ""
    
    cd "$PROJECT_ROOT"
    git worktree list | while IFS= read -r line; do
        worktree_path=$(echo "$line" | awk '{print $1}')
        branch_info=$(echo "$line" | awk '{print $2, $3}')
        
        echo -e "${GREEN}${worktree_path}${NC}"
        echo -e "  ブランチ: ${branch_info}"
        
        if [ -d "$worktree_path" ]; then
            cd "$worktree_path"
            if [ -n "$(git status --porcelain)" ]; then
                echo -e "  状態: ${YELLOW}変更あり${NC}"
            else
                echo -e "  状態: ${GREEN}クリーン${NC}"
            fi
        fi
        echo ""
    done
}

# メイン処理
case "$1" in
    list)
        list_worktrees
        ;;
    create)
        create_worktree "$2" "$3"
        ;;
    add)
        add_worktree "$2"
        ;;
    remove)
        remove_worktree "$2"
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}エラー: 不明なコマンド '$1'${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

