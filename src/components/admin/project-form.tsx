
'use client';

import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addProject, updateProject, uploadImagesToCloudinary } from '@/lib/actions';
import { ministries, states } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { projectFormSchemaRaw, type Project } from '@/types/server';
import { type ProjectFormData } from '@/types/client';
import { useEffect, useState } from 'react';

const projectSchema = z.object({
  title: projectFormSchemaRaw.title(z),
  subtitle: projectFormSchemaRaw.subtitle(z),
  ministryId: projectFormSchemaRaw.ministryId(z),
  stateId: projectFormSchemaRaw.stateId(z),
  status: projectFormSchemaRaw.status(z),
  startDate: projectFormSchemaRaw.startDate(z),
  expectedEndDate: projectFormSchemaRaw.expectedEndDate(z).nullable(),
  description: projectFormSchemaRaw.description(z),
  budget: projectFormSchemaRaw.budget(z).nullable(),
  expenditure: projectFormSchemaRaw.expenditure(z).nullable(),
  tags: projectFormSchemaRaw.tags(z),
  images: projectFormSchemaRaw.images(z).optional(),
});

interface ProjectFormProps {
  initialData?: Project;
  projectId?: string;
  onSuccess?: () => void;
}

export function ProjectForm({ initialData, projectId, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isEditMode = !!projectId;
  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<{ url: string; alt: string; dataAiHint?: string }[]>(initialData?.images || []);

  const { control, register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema as z.Schema<ProjectFormData>),
    defaultValues: initialData ? {
      ...initialData,
      ministryId: initialData.ministry_id || '',
      stateId: initialData.state_id || '',
      startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
      expectedEndDate: initialData.expectedEndDate ? new Date(initialData.expectedEndDate) : null,
      tags: initialData.tags?.join(', ') || '',
      budget: initialData.budget || null,
      expenditure: initialData.expenditure || null,
      images: initialData.images || [],
    } : {
      title: '',
      subtitle: '',
      ministryId: '',
      stateId: '',
      status: 'Planned',
      startDate: new Date(),
      expectedEndDate: null,
      description: '',
      budget: null,
      expenditure: null,
      tags: '',
      images: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        ministryId: initialData.ministry_id || '',
        stateId: initialData.state_id || '',
        startDate: initialData.startDate ? new Date(initialData.startDate) : new Date(),
        expectedEndDate: initialData.expectedEndDate ? new Date(initialData.expectedEndDate) : null,
        tags: initialData.tags?.join(', ') || '',
        budget: initialData.budget || null,
        expenditure: initialData.expenditure || null,
        images: initialData.images || [],
      });
      setImagePreviews(initialData.images || []);
    }
  }, [initialData, reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });

      const result = await uploadImagesToCloudinary(formData);
      if (result.success && result.images) {
        const newImages = result.images.map((img: { url: string }) => ({
          url: img.url,
          alt: `Project image ${new Date().toISOString()}`, // Default alt text
          dataAiHint: '',
        }));
        const updatedImages = [...imagePreviews, ...newImages];
        setImagePreviews(updatedImages);
        setValue('images', updatedImages, { shouldValidate: true });
        toast({
          title: 'Images Uploaded',
          description: `${newImages.length} image(s) uploaded successfully.`,
        });
      } else {
        toast({
          title: 'Image Upload Failed',
          description: result.message || 'Failed to upload images to Cloudinary.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[ProjectForm] Image upload error:', error);
      toast({
        title: 'Image Upload Error',
        description: 'An error occurred while uploading images.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    console.log('[ProjectForm] Submitting data:', data);
    const dataToSubmit = {
      ...data,
      tags: Array.isArray(data.tags) ? data.tags.join(', ') : data.tags,
    };

    let result;
    if (isEditMode && projectId) {
      result = await updateProject(projectId, dataToSubmit);
    } else {
      result = await addProject(dataToSubmit);
    }

    console.log('[ProjectForm] Result:', result);
    if (result.success) {
      toast({
        title: isEditMode ? 'Project Updated!' : 'Project Added!',
        description: result.message,
      });
      if (!isEditMode) reset();
      if (onSuccess) onSuccess();
      router.push('/dashboard/admin/manage-projects');
      router.refresh();
    } else {
      toast({
        title: isEditMode ? 'Error Updating Project' : 'Error Adding Project',
        description: result.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
      console.error('[ProjectForm] Error details:', result.errorDetails);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Project Title</Label>
          <Input id="title" {...register('title')} className="mt-1" />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <Label htmlFor="subtitle">Project Subtitle / Tagline</Label>
          <Input id="subtitle" {...register('subtitle')} className="mt-1" />
          {errors.subtitle && <p className="text-sm text-destructive mt-1">{errors.subtitle.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="ministryId">Responsible Ministry</Label>
          <Controller
            name="ministryId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Ministry" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.ministryId && <p className="text-sm text-destructive mt-1">{errors.ministryId.message}</p>}
        </div>
        <div>
          <Label htmlFor="stateId">State / Location</Label>
          <Controller
            name="stateId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.stateId && <p className="text-sm text-destructive mt-1">{errors.stateId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="status">Project Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {['Planned', 'Ongoing', 'Completed', 'On Hold'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal mt-1', !field.value && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.startDate && <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="expectedEndDate">Expected End Date (Optional)</Label>
          <Controller
            name="expectedEndDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal mt-1', !field.value && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.expectedEndDate && <p className="text-sm text-destructive mt-1">{errors.expectedEndDate.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Project Description</Label>
        <Textarea id="description" {...register('description')} rows={5} className="mt-1" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="budget">Budget (NGN, Optional)</Label>
          <Input id="budget" type="number" {...register('budget')} className="mt-1" placeholder="e.g., 1000000" />
          {errors.budget && <p className="text-sm text-destructive mt-1">{errors.budget.message}</p>}
        </div>
        <div>
          <Label htmlFor="expenditure">Expenditure (NGN, Optional)</Label>
          <Input id="expenditure" type="number" {...register('expenditure')} className="mt-1" placeholder="e.g., 500000" />
          {errors.expenditure && <p className="text-sm text-destructive mt-1">{errors.expenditure.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (Comma-separated, Optional)</Label>
        <Input id="tags" {...register('tags')} className="mt-1" placeholder="e.g., infrastructure, education, health" />
        {errors.tags && <p className="text-sm text-destructive mt-1">{errors.tags.message}</p>}
      </div>

      <div>
        <Label htmlFor="images">Project Images (Optional)</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="mt-1"
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading images...</p>}
        {errors.images && <p className="text-sm text-destructive mt-1">{errors.images.message}</p>}
        {imagePreviews.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Uploaded Images:</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative">
                  <img src={img.url} alt={img.alt} className="h-24 w-full object-cover rounded" />
                  <p className="text-xs text-muted-foreground">{img.alt}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full sm:w-auto button-hover" disabled={isSubmitting || uploading}>
        {isSubmitting || uploading
          ? isEditMode
            ? 'Updating...'
            : 'Adding...'
          : isEditMode
          ? 'Update Project'
          : 'Add Project'}
      </Button>
    </form>
  );
}
