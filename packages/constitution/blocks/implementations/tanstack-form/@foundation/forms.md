# Forms

> Governs where a form's state lives.

## General

### form-state-in-the-form-instance → fact-has-one-source · MUST

Every form's state lives in its form instance. Values, errors, touched and submitting state live there, with no state per field beside it.

#### Why

A field's state kept beside the instance drifts from it, so validation, submission and display disagree about the same field — a single source of truth.

#### Examples

```tsx title="Avoid"
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState<string>();
const form = useForm({ defaultValues: { email: '' }, onSubmit: ({ value }) => subscribe(value) });
```

```tsx title="Prefer"
const form = useForm({
  defaultValues: { email: '' },
  validators: { onChange: newsletterFormSchema },
  onSubmit: ({ value }) => subscribe(value),
});
```
