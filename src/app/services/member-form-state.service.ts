import { Injectable } from '@angular/core';

/**
 * Holds the current member entry in memory so section pages don't each
 * hit the DB independently. The overview page always refreshes from DB on
 * init; section pages read/write the cache and persist to DB themselves.
 */
@Injectable({ providedIn: 'root' })
export class MemberFormStateService {
  private entry: Record<string, any> | null = null;

  setEntry(entry: Record<string, any>): void {
    this.entry = { ...entry };
  }

  getEntry(): Record<string, any> | null {
    return this.entry;
  }

  updateSection(key: string, data: any): void {
    if (!this.entry) this.entry = {};
    this.entry[key] = data;
  }

  hasData(key: string): boolean {
    const data = this.entry?.[key];
    if (!data) return false;
    if (Array.isArray(data)) return data.length > 0;
    return Object.values(data as object).some(
      (v) => v !== null && v !== '' && v !== undefined
    );
  }
}
