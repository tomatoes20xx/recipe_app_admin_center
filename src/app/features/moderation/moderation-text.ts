import { ModAction, ModItem, ModItemStatus } from '../../core/models';

/** One-line name of a queue item: recipe title, comment text or @username. */
export function modItemTitle(item: ModItem): string {
  switch (item.target_type) {
    case 'recipe':
      return item.recipe?.title ?? 'Recipe no longer exists';
    case 'comment':
      return item.comment?.body ? `“${item.comment.body}”` : 'Comment no longer exists';
    default:
      return item.author?.username ? `@${item.author.username}` : 'User no longer exists';
  }
}

export const STATUS_TEXT: Record<ModItemStatus, { label: string; tone: 'ok' | 'warn' | 'bad' | 'muted'; hint: string }> = {
  visible:     { label: 'Visible',      tone: 'ok',    hint: 'Shown in the app' },
  hidden:      { label: 'Hidden',       tone: 'bad',   hint: 'Hidden from the app' },
  deleted:     { label: 'Deleted',      tone: 'muted', hint: 'Deleted by its author' },
  flagged:     { label: 'Flagged',      tone: 'warn',  hint: 'Collapsed behind a warning in the app; people can tap to read it' },
  removed:     { label: 'Removed',      tone: 'bad',   hint: 'Removed from the app' },
  active:      { label: 'Active',       tone: 'ok',    hint: 'Account in good standing' },
  soft_banned: { label: 'Soft banned',  tone: 'warn',  hint: 'Temporarily blocked from posting' },
  banned:      { label: 'Banned',       tone: 'bad',   hint: 'Permanently banned' },
  missing:     { label: 'Gone',         tone: 'muted', hint: 'No longer in the database' },
};

export const RESOLUTION_TEXT: Record<ModAction, string> = {
  dismiss: 'Dismissed',
  hide: 'Hidden',
  restore: 'Restored',
  keep_hidden: 'Kept hidden',
  ban: 'User banned',
};
