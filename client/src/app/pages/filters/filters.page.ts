import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';

import { CategoriesService } from '../../services/categories.service';
import { Category, CategoryType } from '../../models/category.model';
import { DateFilterPreset, DateRange, FilterValue } from '../../models/filter.model';

@Component({
  selector: 'app-transaction-filter',
  standalone: true,
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonDatetime,
    IonDatetimeButton,
    IonModal,
    IonGrid,
    IonRow,
    IonCol
  ],
})
export class FilterComponent implements OnInit {

  /** Show/hide the category dropdown on pages that don't need it */
  @Input() showCategory = true;

  /** Optionally restrict the category dropdown to only 'income' or 'expense' */
  @Input() categoryType: CategoryType | null = null;

  /** Optionally set a different default preset than "thisMonth" */
  @Input() defaultPreset: DateFilterPreset = 'thisMonth';

  /** Fires every time the filter changes, with the final computed values */
  @Output() filterChange = new EventEmitter<FilterValue>();

  selectedPreset: DateFilterPreset = 'thisMonth';
  customFrom: string = new Date().toISOString();
  customTo: string = new Date().toISOString();

  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  constructor(private readonly categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.selectedPreset = this.defaultPreset;

    if (this.showCategory) {
      this.loadCategories();
    }

    this.emitFilter(); // emit default filter immediately so parent gets initial data
  }

  private loadCategories(): void {
    const request$ = this.categoryType
      ? this.categoriesService.getCategoriesByType(this.categoryType)
      : this.categoriesService.getCategories();

    request$.subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Failed to load categories', error);
      }
    });
  }

  onPresetChange(): void {
    this.emitFilter();
  }

  onCustomDateChange(): void {
    if (this.selectedPreset === 'custom') {
      this.emitFilter();
    }
  }

  onCategoryChange(): void {
    this.emitFilter();
  }

  private emitFilter(): void {
    const dateRange = this.calculateDateRange(this.selectedPreset);

    this.filterChange.emit({
      preset: this.selectedPreset,
      dateRange,
      categoryId: this.selectedCategoryId
    });
  }

  private calculateDateRange(preset: DateFilterPreset): DateRange {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (preset) {
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;

      case 'lastMonth':
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;

      case 'thisYear':
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case 'lastYear':
        from = new Date(now.getFullYear() - 1, 0, 1);
        to = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;

      case 'custom':
        from = new Date(this.customFrom);
        to = new Date(this.customTo);
        break;

      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    return {
      from: from.toISOString(),
      to: to.toISOString()
    };
  }
}