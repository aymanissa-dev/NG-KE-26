import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme';

@Component({
  selector: 'app-brand',
  imports: [RouterLink],
  templateUrl: './brand.html',
  styleUrl: './brand.scss',
})
export class Brand {
  constructor(protected themeService: ThemeService) {}
}
