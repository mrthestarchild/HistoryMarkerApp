import { TestBed } from '@angular/core/testing';

import { TextToSpeechService } from './text-to-speech.service';

describe('TextToSpeechServiceService', () => {
  let service: TextToSpeechService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToSpeechService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
