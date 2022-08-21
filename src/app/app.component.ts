import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { catchError, finalize, from, take, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('video') video: ElementRef | undefined;
  @ViewChild('canvas') canvas: ElementRef | undefined;

  public readonly width: number = 640;
  public readonly height: number = 480;
  public loading: boolean = true;
  public isCaptured: boolean = false;
  public imageCaptures: string[] = [];
  public error: string = '';
  public selected: number = 0;
  private readonly errorText: string =
    'Sorry camera device is not exist or not working';

  constructor() {}

  ngAfterViewInit(): void {
    this.setupCamera();
  }

  private setupCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      from(
        navigator.mediaDevices.getUserMedia({
          video: true,
        })
      )
        .pipe(
          take(1),
          tap((stream) => {
            if (stream && this.video) {
              this.video.nativeElement.srcObject = stream;
              this.video.nativeElement.play();
              this.error = '';
            } else {
              this.error = this.errorText;
            }
          }),
          finalize(() => (this.loading = false)),
          catchError((error) => (this.error = error.toString()))
        )
        .subscribe();
    }
  }

  public capture(): void {
    this.drawImageToCanvas(this.video?.nativeElement);
    this.imageCaptures.push(this.canvas?.nativeElement.toDataURL('image/png'));
    this.isCaptured = true;
  }

  public removeCurrent(): void {
    this.isCaptured = false;
  }

  public setPhoto(index: number): void {
    this.isCaptured = true;
    this.selected = index;

    const image = new Image();
    image.src = this.imageCaptures[index];
    this.drawImageToCanvas(image);
  }

  public download(): void {
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('download', 'prettyface.png');

    let dataURL = this.canvas?.nativeElement.toDataURL('image/png');
    let url = dataURL.replace(
      /^data:image\/png/,
      'data:application/octet-stream'
    );
    downloadLink.setAttribute('href', url);
    downloadLink.click();
  }

  private drawImageToCanvas(image: any): void {
    this.canvas?.nativeElement
      .getContext('2d')
      .drawImage(image, 0, 0, this.width, this.height);
  }
}
