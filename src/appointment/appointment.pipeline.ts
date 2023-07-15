import { PipelineStage } from 'mongoose';

export class AppointmentPipeline {
  static lookupDoctors(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'doctors',
          let: { doctorId: '$doctor' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$doctorId'],
                },
              },
            },
            {
              $project: {
                id: '$_id',
                name: 1,
                birthday: 1,
                from: 1,
                to: 1,
                _id: 0,
              },
            },
          ],
          as: 'doctor',
        },
      },
      {
        $unwind: {
          path: '$doctor',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }

  static lookupPatients(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: 'patients',
          let: { patientId: '$patient' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$patientId'],
                },
              },
            },
            {
              $project: {
                id: '$_id',
                name: 1,
                birthday: 1,
                from: 1,
                to: 1,
                _id: 0,
              },
            },
          ],
          as: 'patient',
        },
      },
      {
        $unwind: {
          path: '$patient',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
  }
}
