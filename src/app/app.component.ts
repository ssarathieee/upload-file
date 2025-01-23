import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  files: File[] = [];
  isSwiped: boolean = false; // Track swipe action
  initialX: number = 0;
  pdfSrc:any;
    
  constructor(private http: HttpClient,private sanitizer: DomSanitizer) {}

  // Handle Drag and Drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = event.dataTransfer!.files;
    if (droppedFiles.length) {
      this.handleFileSelection(droppedFiles);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      this.handleFileSelection(input.files);
    }
  }

  private handleFileSelection(files: FileList): void {
    this.files = Array.from(files);
    this.displayPdf(this.files[0])
  }

  // Display PDF file
  displayPdf(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.pdfSrc = e.target.result;  
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfSrc);
    };
    reader.readAsDataURL(file);  
  }
  // Swipe Logic
  startSwipe(event: MouseEvent): void {
    this.initialX = event.clientX;  
  }

  endSwipe(event: MouseEvent): void {
    const swipeDistance = event.clientX - this.initialX;
    if (swipeDistance > 100) {
      this.isSwiped = true;
      this.uploadFiles();
    }
    this.initialX = 0; 
  }

  // Upload Files to Backend
  uploadFiles(): void {
    if (this.files.length > 0) {
      const formData = new FormData();
      this.files.forEach(file => {
        formData.append('files', file, file.name);
      });
      

      // HTTP POST request to backend
      this.http.post('http://localhost:3000/upload', formData, {
        headers: new HttpHeaders(),responseType: 'text'
      }).subscribe(response => {
        console.log('Files uploaded successfully', response);
        alert("File uploaded successfully")
      }, error => {
        console.error('Error uploading files', error);
      });
    } else {
      alert('No files selected');
    }
  }
  downloadFile() {
    this.http.get('http://localhost:3000/download', { 
      responseType: 'blob'  
    }).subscribe((response: Blob) => {
      
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(response);
      //this.pdfSrc = url;
      a.href = url;
      a.download = 'downloaded-file.pdf'; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      

      
    }, (error) => {
      console.error('Error downloading the file:', error);
    });
  }
}
