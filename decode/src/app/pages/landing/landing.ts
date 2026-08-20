import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/theme';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  protected codePreview =
    'function getTotal(items) {\n' +
    '  let total = 0\n' +
    '  for (i = 0; i < items.length; i++) {\n' +
    '    total += items[i].price\n' +
    '  }\n' +
    '  return total\n' +
    '}';

  constructor(protected themeService: ThemeService) {}
}
