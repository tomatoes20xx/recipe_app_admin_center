import { Component, HostListener, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { CMS } from './landing.component.cms';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [NgClass],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  readonly cms = CMS;
  isScrolled = false;

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 8;
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('in');
                this.observer?.unobserve(e.target);
              }
            });
          },
          { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
        );

        const reveals: NodeListOf<HTMLElement> = this.el.nativeElement.querySelectorAll('.reveal');
        reveals.forEach((el, i) => {
          el.style.transitionDelay = `${(i % 4) * 80}ms`;
          this.observer!.observe(el);
        });
      });
    });
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  scrollTo(anchor: string, event?: Event) {
    event?.preventDefault();
    if (anchor === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
}
