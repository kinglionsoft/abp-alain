import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { setUpTestBed } from '../../../../testing/common.spec';

import { DashboardHostComponent } from './host.component';

describe('Comoponent: DashboardV1', () => {
    setUpTestBed(<TestModuleMetadata>{
        declarations: [ DashboardHostComponent ]
    });

    it('should create an instance', () => {
        const fixture = TestBed.createComponent(DashboardHostComponent);
        const comp = fixture.debugElement.componentInstance;
        expect(comp).toBeTruthy();
    });
});
