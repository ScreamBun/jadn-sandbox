const jadnApi = {
	jadn: {
		title: 'JADN Base',
		text: [
			'Base JADN functions and objects'
		],
		body: {
			enum: [
				{
					header: 'CommentLevels',
					enum: [
						{
							name: 'ALL',
							info: {
								info: [
									'Show all comment for conversion'
								]
							}
						},
						{
							name: 'NONE',
							info: {
								info: [
									'Show no comment for conversion'
								]
							}
						}
					]
				}
			],
			function: [
				{
					return: {
						type: 'SET ME',
						info: [
							'SET ME'
						]
					},
					fun_desc: {
						def: 'jadn_analyze(...)',
						info: [
							'SET ME'
						]
					}
				},
				{
					return: {
						type: 'dict',
						info: [
							'JADN formatted dictionary'
						]
					},
					fun_desc: {
						def: 'jadn_check(schema)',
						info: [
							'Validate JADN structure against JSON schema',
    						'Validate JADN structure against JADN schema',
    						'Perform additional checks on type definitions'
						]
					}
				},
				{
					return: {
						type: 'void'
					},
					fun_desc: {
						def: 'jadn_dump(schema, fname, source, strip)',
						info: [
							'Convert a JADN schema to a JADN formatted string',
							'Write string to the given file'
						]
					}
				},
				{
					return: {
						type: 'str',
						info: [
							'JADN string'
						]
					},
					fun_desc: {
						def: 'jadn_dumps(schema, level, indent, strip, nlevel)',
						info: [
							'Convert a JADN schema to a JADN formatted string'
						]
					}
				},
				{
					return: {
						type: 'str',
						info: [
							'JADN formatted string'
						]
					},
					fun_desc: {
						def: 'jadn_format(schema)',
						info: [
							'Convert a JADN schema to a JADN formatted string'
						]
					}
				},
				{
					return: {
						type: 'dict',
						info: [
							'JADN formatted dictionary'
						]
					},
					fun_desc: {
						def: 'jadn_load(fname)',
						info: [
							'Load and check a jadn schema from a JADN file'
						]
					}
				},
				{
					return: {
						type: 'dict',
						info: [
							'JADN formatted dictionary'
						]
					},
					fun_desc: {
						def: 'jadn_loads(jadn_str)',
						info: [
							'Load and check a jadn schema from a JADN string'
						]
					}
				},
				{
					return: {
						type: 'dict',
						info: [
							'JADN formatted dictionary'
						]
					},
					fun_desc: {
						def: 'jadn_merge(base, imp, nsid)',
						info: [
							'Merge an imported schema into a base schema'
						]
					}
				},
				{
					return: {
						type: 'dict',
						info: [
							'JADN formatted dictionary'
						]
					},
					fun_desc: {
						def: 'jadn_strip(schema)',
						info: [
							'Strip comments from schema'
						]
					}
				}
			]
		}
	},
	'jadn.codec': {
		title: 'Validate messages against JADN schema, serialize and deserialize messages',
		text: [
			'codec.py - Message encoder and decoder',
			'codec_format.py - Validation routines usable with the \'format\' option',
			'codec_utils.py - Utility routines used with the Codec class',
			'jadn-defs.py - Constant definitions for the JADN file format',
			'jadn.py - Load, validate, and save JADN schemas'
		],
		body: {
			class: [
				{
					header: 'Codec',
					title: 'Serialize (encode) and De-serialize (decode) values based on JADN syntax.',
					constructor: {
						def: 'Codec(schema, verbose_rec, verbose_str)',
						info: [
							'SET ME'
						]
					},
					function: [
						{
							return: {
								type: 'SET ME',
								info: [
									'SET ME'
								]
							},
							fun_desc: {
								def: 'decode(self, datatype, sval)',
								info: [
									'Decode serialized value into API value'
								]
							}
						},
						{
							return: {
								type: 'SET ME',
								info: [
									'SET ME'
								]
							},
							fun_desc: {
								def: 'encode(self, datatype, aval)',
								info: [
									'Encode API value into serialized value'
								]
							}
						},
						{
							return: {
								type: 'SET ME',
								info: [
									'SET ME'
								]
							},
							fun_desc: {
								def: 'set_mode(verbose_rec, verbose_str)',
								info: [
									'Encode API value into serialized value'
								]
							}
						}
					]
				}
			]
		}
	},
	'jadn.convert': {
		title: 'JADN conversion related functions',
		text: [
			'Conversion classes, enums, and functions'
		],
		body: {
			package: {
				'jadn.convert.message': {
					title: 'JADN Message related classes, enums, and functions',
					body: {
					}
				},
				'jadn.convert.schema': {
					title: 'JADN Schema related classes, enums, and functions',
					body: {
						function: [
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'html_dump(jadn, fname, source, styles)',
									info: [
										'Convert the given JADN to HTML and write output to the specified file',
										'jadn - JADN formatted string, dictionary, file location',
										'fname - File location to write output',
										'source - Name of file being converted (optional)',
										'styles - file location of styles to use for HTML/PDF conversion (optional)'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'HTML string'
									]
								},
								fun_desc: {
									def: 'html_dumps(jadn, styles)',
									info: [
										'Convert the given JADN to HTML',
										'jadn - JADN formatted string, dictionary, file location',
										'styles - file location of styles to use for HTML/PDF conversion (optional)'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'md_dump(jadn, fname, source)',
									info: [
										'Convert the given JADN to MarkDown and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'MarkDown string'
									]
								},
								fun_desc: {
									def: 'md_dumps(jadn, styles)',
									info: [
										'Convert the given JADN to MarkDown'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'cddl_dump(jadn, fname, source, comm)',
									info: [
										'Convert the given JADN to CDDL and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'CDDL string'
									]
								},
								fun_desc: {
									def: 'cddl_dumps(jadn, comm)',
									info: [
										'Convert the given JADN to CDDL'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'cddl_load(cddl, fname, source)',
									info: [
										'Convert the given CDDL to JADN and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JADN string'
									]
								},
								fun_desc: {
									def: 'cddl_loads(cddl)',
									info: [
										'Convert the given CDDL to JADN'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'jas_dump(jas, fname, source)',
									info: [
										'Convert the given JADN to JAS and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JAS string'
									]
								},
								fun_desc: {
									def: 'jas_dumps(jas, comm)',
									info: [
										'Convert the given JADN to JAS'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'jas_load(jas, fname, source)',
									info: [
										'Convert the given JAS to JADN and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JADN string'
									]
								},
								fun_desc: {
									def: 'jas_loads(jas)',
									info: [
										'Convert the given JAS to JADN'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'proto_dump(proto, fname, source)',
									info: [
										'Convert the given JADN to ProtoBuf3 and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'ProtoBuf3 string'
									]
								},
								fun_desc: {
									def: 'proto_dumps(proto, comm)',
									info: [
										'Convert the given JADN to ProtoBuf3'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'proto_load(proto, fname, source)',
									info: [
										'Convert the given ProtoBuf3 to JADN and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JADN string'
									]
								},
								fun_desc: {
									def: 'proto_loads(proto)',
									info: [
										'Convert the given ProtoBuf3 to JADN'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'relax_dump(relax, fname, source)',
									info: [
										'Convert the given JADN to Relax-NG and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'Relax-NG string'
									]
								},
								fun_desc: {
									def: 'relax_dumps(relax, comm)',
									info: [
										'Convert the given JADN to Relax-NG'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'relax_load(relax, fname, source)',
									info: [
										'Convert the given Relax-NG to JADN and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JADN string'
									]
								},
								fun_desc: {
									def: 'relax_loads(relax)',
									info: [
										'Convert the given Relax-NG to JADN<'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'thrift_dump(thrift, fname, source)',
									info: [
										'Convert the given JADN to Thrift and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'Thrift string'
									]
								},
								fun_desc: {
									def: 'thrift_dumps(thrift, comm)',
									info: [
										'Convert the given JADN to Thrift'
									]
								}
							},
							{
								return: {
									type: 'void'
								},
								fun_desc: {
									def: 'thrift_load(thrift, fname, source)',
									info: [
										'Convert the given Thrift to JADN and write output to the specified file'
									]
								}
							},
							{
								return: {
									type: 'str',
									info: [
										'JADN string'
									]
								},
								fun_desc: {
									def: 'thrift_loads(thrift)',
									info: [
										'Convert the given Thrift to JADN'
									]
								}
							}
						]
					}
				}
			}
		}
	}
};

export default jadnApi;