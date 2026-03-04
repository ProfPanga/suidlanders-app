import {
  Component,
  forwardRef,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import {
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonItemDivider,
  IonItemGroup,
  IonNote,
} from '@ionic/angular/standalone';
import { DocumentsInfo } from '../../../interfaces/form-sections.interface';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { ExportService } from '../../../services/export.service';
import { DatabaseService } from '../../../services/database.service';
import { addCircleOutline, documentOutline, closeCircle } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-documents-info',
  templateUrl: './documents-info.component.html',
  styles: [
    `
      :host {
        display: block;
        margin-bottom: 1rem;
      }

      .file-input {
        display: none;
      }

      .upload-button {
        margin: 1rem 0 0.25rem;
        width: 100%;
      }
      .file-list {
        margin: 0.5rem 0 0.25rem;
      }
      .uploader {
        width: 100%;
        display: block;
      }
      .stack {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .file-rows {
        margin-top: 0.25rem;
      }
      .file-row {
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
        background: var(--ion-color-step-100);
        border-radius: 8px;
        gap: 8px;
        overflow: hidden;
      }
      .file-row + .file-row {
        margin-top: 0.5rem;
      }
      .file-row ion-icon:first-child {
        font-size: 20px;
        margin-right: 8px;
        color: var(--ion-color-medium);
      }
      .file-name {
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0; /* allow ellipsis in flex container */
      }
      .helper-text {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        margin-top: 0.25rem;
        margin-left: 0;
      }
      .file-actions ion-icon {
        font-size: 20px;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonItemDivider,
    IonItemGroup,
    IonNote,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentsInfoComponent),
      multi: true,
    },
  ],
})
export class DocumentsInfoComponent implements ControlValueAccessor, OnInit {
  form: FormGroup;
  isDisabled = false;
  acceptedFileTypes = '.pdf,.jpg,.jpeg,.png';
  maxFileSize = 10 * 1024 * 1024; // 10MB
  // no replace flow when multiple allowed

  // Inputs used for replace actions
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('licenseInput') licenseInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('firearmInput') firearmInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('ehboInput') ehboInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('otherInput') otherInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private exportService: ExportService,
    private databaseService: DatabaseService
  ) {
    addIcons({ addCircleOutline, documentOutline, closeCircle });

    this.form = this.fb.group({
      idDokument: [[]],
      bestuurslisensie: [[]],
      vuurwapenlisensie: [[]],
      ehboSertifikaat: [[]],
      ander: [[]],
    });
  }

  async ngOnInit() {
    // Rehydrate from DB on component init to ensure persistence even if parent didn't pass value yet
    try {
      const entry = await this.databaseService.getCurrentMemberEntry();
      if (entry?.documentsInfo) {
        this.form.patchValue(entry.documentsInfo, { emitEvent: false });
        this.onChange(this.form.value);
      }
    } catch {
      // ignore
    }
  }

  // File handling methods
  async onFileSelected(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!this.validateFile(file)) return;

      const saved = await this.saveFileToStorage(file);
      if (!saved) return;

      const current = this.form.get(controlName)?.value || [];
      this.form.patchValue({ [controlName]: [...current, saved] });
      this.onChange(this.form.value);
    }
  }

  // Open chooser for adding a document
  openChooser(controlName: string) {
    switch (controlName) {
      case 'idDokument':
        this.fileInputRef?.nativeElement?.click();
        break;
      case 'bestuurslisensie':
        this.licenseInputRef?.nativeElement?.click();
        break;
      case 'vuurwapenlisensie':
        this.firearmInputRef?.nativeElement?.click();
        break;
      case 'ehboSertifikaat':
        this.ehboInputRef?.nativeElement?.click();
        break;
      case 'ander':
        this.otherInputRef?.nativeElement?.click();
        break;
    }
  }

  async removeFile(controlName: string, index?: number) {
    try {
      if (typeof index === 'number') {
        const currentFiles = [...(this.form.get(controlName)?.value || [])];
        const fileMeta = currentFiles[index];
        if (fileMeta?.path) {
          await Filesystem.deleteFile({
            path: fileMeta.path,
            directory: Directory.Data,
          });
        }
        currentFiles.splice(index, 1);
        this.form.patchValue({ [controlName]: currentFiles });
      } else {
        // If no index provided, remove last item as a fallback
        const current = [...(this.form.get(controlName)?.value || [])];
        const removed = current.pop();
        if (removed?.path) {
          await Filesystem.deleteFile({
            path: removed.path,
            directory: Directory.Data,
          });
        }
        this.form.patchValue({ [controlName]: current });
      }
      this.onChange(this.form.value);
    } catch {
      // ignore delete errors
    }
  }

  validateFile(file: File): boolean {
    if (file.size > this.maxFileSize) {
      alert('Lêer is te groot. Maksimum grootte is 10MB.');
      return false;
    }

    const fileType = file.name.toLowerCase().split('.').pop();
    const validTypes = this.acceptedFileTypes
      .split(',')
      .map((type) => type.replace('.', ''));
    if (!fileType || !validTypes.includes(fileType)) {
      alert('Ongeldige lêertipe. Aanvaarde tipes: PDF, JPG, JPEG, PNG');
      return false;
    }

    return true;
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileName(controlName: string): string {
    const files = this.form.get(controlName)?.value || [];
    return files.length ? files[files.length - 1].name : '';
  }

  // ControlValueAccessor implementation
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: DocumentsInfo): void {
    if (value) {
      this.form.patchValue(value, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
    this.form.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (control && control.errors && (control.dirty || control.touched)) {
      if (control.errors['required']) {
        return 'Hierdie veld is verpligtend';
      }
    }
    return '';
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  private async saveFileToStorage(file: File): Promise<any | null> {
    try {
      const base64 = await this.readFileAsBase64(file);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `documents/${Date.now()}-${safeName}`;
      await Filesystem.writeFile({
        path: filePath,
        data: base64,
        directory: Directory.Data,
        recursive: true,
      });
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      };
    } catch (e) {
      alert('Kon nie lêer stoor nie. Probeer asseblief weer.');
      return null;
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Testing helper: copy stored private files to user-visible Documents/Suidlanders
  async exportAllForTesting() {
    try {
      const docs = this.form.value as any;
      const metas: any[] = [];
      const pushArray = (arr: any[]) =>
        Array.isArray(arr) && arr.forEach((m) => m?.path && metas.push(m));
      pushArray(docs.idDokument);
      pushArray(docs.bestuurslisensie);
      pushArray(docs.vuurwapenlisensie);
      pushArray(docs.ehboSertifikaat);
      pushArray(docs.ander);

      for (const meta of metas) {
        try {
          const res = await Filesystem.readFile({
            path: meta.path,
            directory: Directory.Data,
          });
          const outPath = `Suidlanders/${meta.name}`;
          await Filesystem.writeFile({
            path: outPath,
            data: res.data,
            directory: Directory.Documents,
            recursive: true,
          });
        } catch (e) {
          // continue with next
        }
      }
      alert("Dokumente gekopieer na 'Documents/Suidlanders' vir toetsing.");
    } catch (e) {
      alert('Kon nie dokumente uitvoer vir toetsing nie.');
    }
  }

  // Export documents + HTML to Downloads/Documents/Suidlanders/<memberId|timestamp>/
  async exportToDownloads() {
    try {
      const entry = await this.databaseService.getCurrentMemberEntry();
      const folderName = `Suidlanders/${
        entry?.entryId || 'export-' + Date.now()
      }`;

      // Generate HTML for the current entry
      if (entry) {
        const html = await this.exportService.generateHTML(entry);
        try {
          await Filesystem.writeFile({
            path: `${folderName}/lid-inligting.html`,
            data: html,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
            recursive: true,
          });
        } catch {
          // Fallback to ExternalStorage/Download if Documents fails
          await Filesystem.writeFile({
            path: `Download/${folderName}/lid-inligting.html`,
            data: html,
            directory: Directory.ExternalStorage,
            encoding: Encoding.UTF8,
            recursive: true,
          });
        }
      }

      const metas: any[] = [];
      const docs = this.form.value as any;
      const pushArray = (arr: any[]) =>
        Array.isArray(arr) && arr.forEach((m) => m?.path && metas.push(m));
      pushArray(docs.idDokument);
      pushArray(docs.bestuurslisensie);
      pushArray(docs.vuurwapenlisensie);
      pushArray(docs.ehboSertifikaat);
      pushArray(docs.ander);

      for (const meta of metas) {
        try {
          const res = await Filesystem.readFile({
            path: meta.path,
            directory: Directory.Data,
          });
          try {
            await Filesystem.writeFile({
              path: `${folderName}/${meta.name}`,
              data: res.data,
              directory: Directory.Documents,
              recursive: true,
            });
          } catch {
            await Filesystem.writeFile({
              path: `Download/${folderName}/${meta.name}`,
              data: res.data,
              directory: Directory.ExternalStorage,
              recursive: true,
            });
          }
        } catch {}
      }

      alert(
        `Gestoorde kopie geskep (kyk in Dokumente of Downloads/Suidlanders).`
      );
    } catch (e) {
      alert('Kon nie dokumente uitvoer nie.');
    }
  }

  // Create a temporary export and open system share sheet (Bluetooth/Nearby Share/etc)
  async shareAll() {
    try {
      const entry = await this.databaseService.getCurrentMemberEntry();
      const baseFolder = `Suidlanders/share-${Date.now()}`;
      const filesForShare: string[] = [];

      // HTML
      if (entry) {
        const html = await this.exportService.generateHTML(entry);
        const htmlRes = await Filesystem.writeFile({
          path: `${baseFolder}/lid-inligting.html`,
          data: html,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        if ((htmlRes as any).uri) filesForShare.push((htmlRes as any).uri);
      }

      // Docs
      const docs = this.form.value as any;
      const metas: any[] = [];
      const pushArray = (arr: any[]) =>
        Array.isArray(arr) && arr.forEach((m) => m?.path && metas.push(m));
      pushArray(docs.idDokument);
      pushArray(docs.bestuurslisensie);
      pushArray(docs.vuurwapenlisensie);
      pushArray(docs.ehboSertifikaat);
      pushArray(docs.ander);

      for (const meta of metas) {
        try {
          const res = await Filesystem.readFile({
            path: meta.path,
            directory: Directory.Data,
          });
          const out = await Filesystem.writeFile({
            path: `${baseFolder}/${meta.name}`,
            data: res.data,
            directory: Directory.Documents,
            recursive: true,
          });
          if ((out as any).uri) filesForShare.push((out as any).uri);
        } catch {}
      }

      await Share.share({
        title: 'Deel Suidlanders Dokumente',
        text: 'Dokumente en HTML',
        files: filesForShare,
      });
    } catch (e) {
      alert('Kon nie dokumente deel nie.');
    }
  }
}
